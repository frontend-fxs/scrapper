
async function mongoConnect() {
    let MongoClient = require('mongodb').MongoClient;
    let url = "mongodb://localhost:27017/";
    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let webscrapper = client.db("webscrapper");
    return { webscrapper: webscrapper, client: client };
}

async function getNextPageNotVisited() {
    let { webscrapper, client } = await mongoConnect();
    const res = await webscrapper.collection("pageList").findOne({ visited: false });
    client.close();
    return res.url;
}

async function savePageList(dataObj) {
    let { webscrapper, client } = await mongoConnect();
    for (let i = 0; i < dataObj.links.length; i++) {
        href = dataObj.links[i];
        if (/^\//.test(href)) {
            href = domain + href;
        };
        if (/\.fxstreet\./.test(href)) {
            let linkNotExist = webscrapper.collection('pageList').find({ "url": href }).length < 1;
            if (linkNotExist) {
                webscrapper.collection('pageList').insertOne({ url: href, visited: false });
            };
        };
    };
 
    let result = {};

    for (let i = 0; i < dataObj.classList.length; ++i) {
        if (!result[dataObj.classList[i]]) {
            result[dataObj.classList[i]] = 0;
        }
        ++result[dataObj.classList[i]];
    }

    let classList = []

    for (const property in result) {
        classList.push({ className: property, appearances: result[property] })
    }

    webscrapper.collection('pageList').insertOne({ url: URL, visited: true, classList: classList });
    client.close();
    return true;
}

async function saveClassList(dataObj) {
    let { webscrapper, client } = await mongoConnect();
    for (let i = 0; i < dataObj.classList.length; i++) {
        let className = dataObj.classList[i];
        let classNotExist = webscrapper.collection('classList').find({ "className": className }).length < 1;
        if (classNotExist) {
            webscrapper.collection('classList').insertOne({ className: className });
        };
    }
    client.close();
    return true;
}

module.exports.getNextPageNotVisited = getNextPageNotVisited;
module.exports.savePageList = savePageList;
module.exports.saveClassList = saveClassList;
