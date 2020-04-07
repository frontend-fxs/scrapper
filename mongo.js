async function mongoConnect() {
    let MongoClient = require('mongodb').MongoClient;
    let url = "mongodb://localhost:27017/";
    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let webscrapper = client.db("webscrapper");
    return { webscrapper: webscrapper, client: client };
}
async function reset() {
    let { webscrapper, client } = await mongoConnect();    
    await webscrapper.collection("pageList").updateMany({}, { $set: { "visited": false } }).catch(e => console.log(e));
    await webscrapper.collection("classList").updateMany({}, { $set: { "appearances": 0 } }).catch(e => console.log(e));
    await extractClassNamesFromSiteStylesheet()
    client.close();
    return true;
}
async function getData(url){
    let axios = require("axios");
    try {
        let response = await axios.get(url);
        let data = response.data;
        return data;
    } catch (error) {
        console.log(error);
    }
}
async function extractClassNamesFromSiteStylesheet(){
    let { webscrapper, client } = await mongoConnect();    
    let url = "https://staticcontent.fxstreet.com/website/css/fxs_screen.css";
    let stylesheet = await getData(url);
    let extract = require("string-extract-class-names");
    let classArray = extract(stylesheet);
    for (let i = 0; i < classArray.length; i++) {
        let className = classArray[i];
        console.log(className);
        let exist = await webscrapper.collection('classList').findOne({ "className": className });
        if (!exist) {
            console.log('ClassName from stylesheet does not appear on database.  ', className);
            await webscrapper.collection('classList').insertOne({ "className": className, "appearances": 0 });
        };
    };
    client.close();
    return true;
}
async function getNextPageNotVisited() {
    let { webscrapper, client } = await mongoConnect();
    let res = await webscrapper.collection("pageList").findOne({ "visited": false });
    client.close();
    console.log(new Date(), res);
    return res.url;
}
async function updatePageList(dataObj, pageURL) {
    let { extractHostname } = require('./utils.js');
    let { webscrapper, client } = await mongoConnect();
    let domain = extractHostname(pageURL);
    for (let i = 0; i < dataObj.links.length; i++) {
        href = dataObj.links[i];
        if (href) {
            if (/^\//.test(href)) {
                href = domain + href;
            };
            if (href.includes("?")) {
                href = href.slice(0, href.indexOf("?"));
            }
            if (href.includes("#")) {
                href = href.slice(0, href.indexOf("#"));
            }
            if (/\.fxstreet\./.test(href)) {
                let link = await webscrapper.collection('pageList').findOne({ "url": href });
                if (!link) {
                    await webscrapper.collection('pageList').insertOne({ "url": href, "visited": false });
                };
            };
        }
    };
    await webscrapper.collection('pageList').updateOne({ "url": pageURL }, { $set: { "visited": true } }, { upsert: true });
    client.close();
    return true;
}
async function updateClassList(dataObj, pageURL) {
    let { webscrapper, client } = await mongoConnect();
    for (let i = 0; i < dataObj.classList.length; i++) {
        let className = dataObj.classList[i];
        let classObject = await webscrapper.collection('classList').findOne({ "className": className });
        if (classObject) {
            classObject.appearances++;
            if (!classObject.pages.includes(pageURL)) {
                classObject.pages.push(pageURL);
            }
            await webscrapper.collection('classList').updateOne({ "className": className }, { $set: { "appearances": classObject.appearances, "pages": classObject.pages } }, { upsert: true });
        } else {
            await webscrapper.collection('classList').insertOne({ "className": className, "appearances": 1, "pages": [pageURL] });
        }
    };
    client.close();
    return true;
}
async function getPageList(pageURL) {
    let { webscrapper, client } = await mongoConnect();
    let pageObject = await webscrapper.collection('pageList').find({ "url": pageURL }).toArray().catch(error => console.log(error));
    client.close();
    return pageObject;
}
async function getEntirePageList() {
    let { webscrapper, client } = await mongoConnect();
    let pageList = await webscrapper.collection('pageList').find({}).sort({ visited: -1, url: 1 }).toArray().catch(error => console.log(error));
    let totalCount = await webscrapper.collection('pageList').find({}).count();
    let scrappedCount = await webscrapper.collection('pageList').find({ "visited": true }).count();
    let remainCount = await webscrapper.collection('pageList').find({ "visited": false }).count();
    client.close();
    return {
        pageList: pageList, totalCount: totalCount, scrappedCount: scrappedCount, remainCount: remainCount };
}
async function getClassList(className) {
    let { webscrapper, client } = await mongoConnect();
    console.log();
    let classObject = await webscrapper.collection('classList').find({ "className": className }).sort({ appearances: 1 }).toArray().catch(error => console.log(error));
    client.close();
    return classObject;
}
async function getEntireClassList() {
    let { webscrapper, client } = await mongoConnect();
    let classList = await webscrapper.collection('classList').find({}).sort({ appearances: 1 }).toArray().catch(error => console.log(error));
    client.close();
    return classList;
}
module.exports.reset = reset;
module.exports.getNextPageNotVisited = getNextPageNotVisited;
module.exports.updatePageList = updatePageList;
module.exports.updateClassList = updateClassList;
module.exports.getPageList = getPageList;
module.exports.getClassList = getClassList;
module.exports.getEntireClassList = getEntireClassList;
module.exports.getEntirePageList = getEntirePageList;
module.exports.extractClassNamesFromSiteStylesheet = extractClassNamesFromSiteStylesheet;
