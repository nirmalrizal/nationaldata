const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const makeRequestForData = async url => {
  try {
    const resp = await axios(url);
    if (resp.status === 200) {
      return resp.data;
    }
    return null;
  } catch (err) {
    return null;
  }
};

const getPageTitle = rawHtml => {
  const $ = cheerio.load(rawHtml);
  const tempTitle = $(".headerRowTitle h2").text();
  const title = tempTitle && tempTitle.trim();
  return title;
};

const getDataCallId = rawHtml => {
  const iniRegex = /\?id="\+/g;
  const iniPos = rawHtml.search(iniRegex);

  const finalRegex = /\+"&tgid=/g;
  const finalPos = rawHtml.search(finalRegex);

  const idInitialIndex = iniPos + 6;
  const idFinalIndex = finalPos;

  const dataCallId = rawHtml.substring(idInitialIndex, idFinalIndex);
  return dataCallId;
};

const getLocalLevelWardIdList = rawHtml => {
  const $ = cheerio.load(rawHtml);
  const wardAnchors = $(".container .nav .dropdown a");
  const idsList = [];
  wardAnchors.each((anchorIndex, anchor) => {
    const anchorHref = $(anchor).attr("href");
    idsList.push(anchorHref.replace("/Ward/Index/", ""));
  });
  return idsList;
};

function createNewFolder(folderPath) {
  const dirPath = path.resolve(__dirname, folderPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

const getFormattedFileNameForData = text => {
  return text
    .toLowerCase()
    .split(" ")
    .map(trimMyText)
    .filter(word => Boolean(word))
    .join("-");
};

const trimMyText = text => removeEmptyText(text.trim());
const removeEmptyText = text => {
  if (text) {
    const filteredText = text.replace(/\(|\)/g, "").replace(/\/|\\/g, " ");
    return filteredText;
  }
};

const scrapeAndSavePageData = (rawHtml, parentPath) => {
  const $ = cheerio.load(rawHtml);
  const pagePanels = $(".panel.panel-default");
  pagePanels.each((index, panel) => {
    // if (index === 5) {
    const panelSel = $(panel);
    const panelTitleTempValue = panelSel
      .find(".panel-heading h5")
      .text()
      .split("\n")
      .map(trimMyText)
      .filter(text => Boolean(text));

    const panelTitle = panelTitleTempValue[0];
    const panelDataType = panelTitleTempValue[1];
    const formattedFileName = getFormattedFileNameForData(panelTitle);

    const tableSel = panelSel.find("table.table");
    const filePath = path.resolve(
      __dirname,
      `${parentPath}/csvs/${formattedFileName}.csv`
    );
    createNewFolder(`${parentPath}/csvs`);
    fs.writeFileSync(filePath, `"${panelTitle}","${panelDataType}"\n`);
    const tableTrs = tableSel.find("tr");
    tableTrs.each((trIndex, tr) => {
      const tds = $(tr).find("td");
      if (tds.text().trim()) {
        const tdValues = [];
        tds.each((tdIndex, td) => {
          const singleTdValue = $(td).text();
          tdValues.push(singleTdValue.trim());
        });
        let fileContent = `"${tdValues[0]}","${tdValues[1]}"\n`;
        if (trIndex === tableTrs.length - 1) {
          fileContent = `"${tdValues[0]}","${tdValues[1]}"`;
        }
        writeTextInFile(fileContent, filePath);
      }

      const th = $(tr).find("th");
      const thText = th.text().trim();
      if (thText) {
        writeTextInFile(`"${thText}",""\n`, filePath);
      }
    });
    // }
  });
};

function writeTextInFile(text, filePath) {
  fs.writeFileSync(filePath, text, { flag: "a" });
}

function get2DNumber(num) {
  return (num.toString().length < 2 ? "0" + num : num).toString();
}

module.exports = {
  makeRequestForData,
  getPageTitle,
  getDataCallId,
  createNewFolder,
  scrapeAndSavePageData,
  get2DNumber,
  getLocalLevelWardIdList
};
