const {
  makeRequestForData,
  getPageTitle,
  getDataCallId,
  createNewFolder,
  scrapeAndSavePageData,
  get2DNumber
} = require("./utils");

fetchAndSaveProvinceData();

async function fetchAndSaveProvinceData() {
  createNewFolder("data");
  for (let i = 1; i <= 7; i += 1) {
    const provincePageHtml = await makeRequestForData(
      `http://nationaldata.gov.np/Province/Index/${i}`
    );
    if (provincePageHtml) {
      const title = getPageTitle(provincePageHtml);
      const dataCallId = getDataCallId(provincePageHtml);

      console.log(`Fetching data for province : ${title}`);
      const provinceDataResponse = await makeRequestForData(
        `http://nationaldata.gov.np/Province/GetData?id=${dataCallId}&tgid=0&tsgid=0&tid=0&year=2011`
      );
      if (provinceDataResponse) {
        const folderPath = `data/${title}`;
        createNewFolder(folderPath);

        scrapeAndSavePageData(provinceDataResponse, folderPath);
      }
      await fetchAndSaveProvinceDistrictData(i, title);
    }
  }
}

async function fetchAndSaveProvinceDistrictData(provinceIndex, provinceName) {
  createNewFolder(`data/${provinceName}/District`);
  let loopIndex = 1;
  let isPagePresent = true;
  while (isPagePresent) {
    const pageHtmlUrl = `http://nationaldata.gov.np/District/Index/${provinceIndex}${get2DNumber(
      loopIndex
    )}`;
    const districtPageHtml = await makeRequestForData(pageHtmlUrl);
    if (districtPageHtml) {
      const title = getPageTitle(districtPageHtml);
      const dataCallId = getDataCallId(districtPageHtml);

      console.log(`  Fetching data for district : ${title}`);
      const pageDataUrl = `http://nationaldata.gov.np/District/GetData?id=${dataCallId}&tgid=0&tsgid=0&tid=0&year=2011`;
      const districtDataResponse = await makeRequestForData(pageDataUrl);
      if (districtDataResponse) {
        const folderPath = `data/${provinceName}/District/${title}`;
        createNewFolder(folderPath);

        scrapeAndSavePageData(districtDataResponse, folderPath);
      }
      await fetchAndSaveProvinceLocalLevelData(
        provinceIndex,
        provinceName,
        loopIndex,
        title
      );
    } else {
      isPagePresent = false;
    }
    loopIndex += 1;
  }
}

async function fetchAndSaveProvinceLocalLevelData(
  provinceIndex,
  provinceName,
  districtIndex,
  districtName
) {
  createNewFolder(`data/${provinceName}/District/${districtName}/LocalLevel`);
  let loopIndex = 1;
  let isPagePresent = true;
  while (isPagePresent) {
    const pageHtmlUrl = `http://nationaldata.gov.np/LocalLevel/Index/${provinceIndex}${get2DNumber(
      districtIndex
    )}${get2DNumber(loopIndex)}`;
    const localLevelPageHtml = await makeRequestForData(pageHtmlUrl);
    if (localLevelPageHtml) {
      const title = getPageTitle(localLevelPageHtml);
      const dataCallId = getDataCallId(localLevelPageHtml);

      console.log(`    Fetching data for local level : ${title}`);
      const pageDataUrl = `http://nationaldata.gov.np/LocalLevel/GetData?id=${dataCallId}&tgid=0&tsgid=0&tid=0&year=2011`;
      const localLevelDataResponse = await makeRequestForData(pageDataUrl);
      if (localLevelDataResponse) {
        const folderPath = `data/${provinceName}/District/${districtName}/LocalLevel/${title}`;
        createNewFolder(folderPath);

        scrapeAndSavePageData(localLevelDataResponse, folderPath);
      }
    } else {
      isPagePresent = false;
    }
    loopIndex += 1;
  }
}
