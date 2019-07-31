const {
  makeRequestForData,
  getPageTitle,
  getDataCallId,
  createNewFolder,
  scrapeAndSavePageData,
  get2DNumber,
  getLocalLevelWardIdList
} = require("./utils");

const dataYears = ['2018', '2019'];

fetchAllYearsData();

async function fetchAllYearsData(){
  for(let y=0;y<dataYears.length;y+=1){
    await fetchAndSaveProvinceData(dataYears[y]);
  }
}


async function fetchAndSaveProvinceData(year) {
  createNewFolder("data");
  for (let i = 1; i <= 7; i += 1) {
    const provincePageHtml = await makeRequestForData(
      `http://nationaldata.gov.np/Province/Index/${i}`
    );
    if (provincePageHtml) {
      const title = getPageTitle(provincePageHtml);
      const dataCallId = getDataCallId(provincePageHtml);

      console.log(`${year} : Fetching data for province : ${title}`);
      const provinceDataResponse = await makeRequestForData(
        `http://nationaldata.gov.np/Province/GetData?id=${dataCallId}&tgid=0&tsgid=0&tid=0&year=${year}`
      );
      if (provinceDataResponse) {
        const folderPath = `data/${title}`;
        createNewFolder(folderPath);

        scrapeAndSavePageData(provinceDataResponse, folderPath, year);
      }
      await fetchAndSaveProvinceDistrictData(i, title, year);
    }
  }
}

async function fetchAndSaveProvinceDistrictData(provinceIndex, provinceName, year) {
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

      console.log(`  ${year} : Fetching data for district : ${title}`);
      const pageDataUrl = `http://nationaldata.gov.np/District/GetData?id=${dataCallId}&tgid=0&tsgid=0&tid=0&year=${year}`;
      const districtDataResponse = await makeRequestForData(pageDataUrl);
      if (districtDataResponse) {
        const folderPath = `data/${provinceName}/District/${title}`;
        createNewFolder(folderPath);

        scrapeAndSavePageData(districtDataResponse, folderPath, year);
      }
      await fetchAndSaveProvinceLocalLevelData(
        provinceIndex,
        provinceName,
        loopIndex,
        title,
        year
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
  districtName,
  year
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
      const wardsIdList = getLocalLevelWardIdList(localLevelPageHtml);

      console.log(`    ${year} : Fetching data for local level : ${title}`);
      const pageDataUrl = `http://nationaldata.gov.np/LocalLevel/GetData?id=${dataCallId}&tgid=0&tsgid=0&tid=0&year=${year}`;
      const localLevelDataResponse = await makeRequestForData(pageDataUrl);
      if (localLevelDataResponse) {
        const folderPath = `data/${provinceName}/District/${districtName}/LocalLevel/${title}`;
        createNewFolder(folderPath);

        scrapeAndSavePageData(localLevelDataResponse, folderPath, year);
      }
      await fetchAndSaveLocalLevelWardData(
        provinceName,
        districtName,
        title,
        wardsIdList,
        year
      );
    } else {
      isPagePresent = false;
    }
    loopIndex += 1;
  }
}

async function fetchAndSaveLocalLevelWardData(
  provinceName,
  districtName,
  localLevelName,
  wardsList,
  year
) {
  createNewFolder(
    `data/${provinceName}/District/${districtName}/LocalLevel/${localLevelName}/Ward`
  );
  for (let i = 0; i < wardsList.length; i += 1) {
    console.log(`      ${year} : Fetching data for ward number : ${i + 1}`);
    const pageDataUrl = `http://nationaldata.gov.np/Ward/GetData?id=${
      wardsList[i]
    }&tgid=0&tsgid=0&tid=0&year=${year}`;
    const wardDataResponse = await makeRequestForData(pageDataUrl);
    if (wardDataResponse) {
      const folderPath = `data/${provinceName}/District/${districtName}/LocalLevel/${localLevelName}/Ward/${i +
        1}`;
      createNewFolder(folderPath);

      scrapeAndSavePageData(wardDataResponse, folderPath, year);
    }
  }
}
