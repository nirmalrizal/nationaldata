const {
  makeRequestForData,
  getPageTitle,
  getDataCallId,
  createNewFolder,
  scrapeAndSavePageData
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
    }
  }
}
