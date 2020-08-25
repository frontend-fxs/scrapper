let { getNextPageNotVisited, updatePageList, updateClassList } = require('./mongo.js');
let { scrapPage } = require('./puppeteer.js');
async function scrapPages() {
    let URL = await getNextPageNotVisited();
    if(URL){
        console.log('next page not visited ' , URL);
        let dataObj = await scrapPage(URL);
        await updatePageList(dataObj, URL);
        await updateClassList(dataObj, URL);
        scrapPages();
    }else{
        console.log('all links visited');
    }
};
(async () => {
    await scrapPages();
})().catch(err => console.log(err));
