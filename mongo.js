async function mongoConnect() {
    let MongoClient = require('mongodb').MongoClient;
    let url = "mongodb://localhost:27017/";
    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let webscrapper = client.db("webscrapper");
    return { webscrapper: webscrapper, client: client };
}
async function drop() {
    let { webscrapper, client } = await mongoConnect();
    await webscrapper.collection("pageList").deleteMany();
    await webscrapper.collection("classList").deleteMany();
    await webscrapper.collection("pageList").insertOne({ "url": "https://www.fxstreet.com/", "visited": false });
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
            if (!classObject.pages.includes(pageURL)){
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
    let pageList = await webscrapper.collection('pageList').find({}).sort({ visited: -1,url: 1 }).toArray().catch(error => console.log(error));
    let count = await webscrapper.collection('pageList').find({}).count();
    client.close();
    return {pageList:pageList,count:count};
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
module.exports.drop = drop;
module.exports.getNextPageNotVisited = getNextPageNotVisited;
module.exports.updatePageList = updatePageList;
module.exports.updateClassList = updateClassList;
module.exports.getPageList = getPageList;
module.exports.getClassList = getClassList; 
module.exports.getEntireClassList = getEntireClassList; 
module.exports.getEntirePageList = getEntirePageList;