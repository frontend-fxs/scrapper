let { getNextPageNotVisited, updatePageList, updateClassList} = require('./mongo.js');
let { scrapPage } = require('./puppeteer.js');
async function scrapPages() {
    let URL = await getNextPageNotVisited();
    let dataObj = await scrapPage(URL);
    await updatePageList(dataObj, URL);
    await updateClassList(dataObj, URL);
    if (await getNextPageNotVisited()){
        scrapPages();
    }else{
        console.log('all links visited');
    }
};
(async () => {
    await scrapPages();
})().catch(err => console.log(err));
