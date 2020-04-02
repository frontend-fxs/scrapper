
async function mongoConnect() {

    let MongoClient = require('mongodb').MongoClient;

    let url = "mongodb://localhost:27017/";

    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

    let webscrapper = client.db("webscrapper");

    return { webscrapper: webscrapper, client: client };

}

async function getNextPageNotVisited() {

    let { webscrapper, client } = await mongoConnect();

    let res = await webscrapper.collection("pageList").findOne({ visited: false });

    if(res){

        console.log('Get first page not visited ', res);


    }else{

        console.log('first execution, setting first url as fxstreet home page ');

        await webscrapper.collection('pageList').insertOne({ url: 'https://www.fxstreet.com', visited: false });

        res = await webscrapper.collection("pageList").findOne({ visited: false });

    }

    client.close();

    console.log('returning result url ', res.url);

    return res.url; 

}

async function updatePageList(dataObj, pageURL) {

    let { extractHostname } = require('./utils.js');

    let { webscrapper, client } = await mongoConnect();

    let domain = extractHostname(pageURL);

    console.log('Extraemos el dominio de la URL', domain);

    console.log('Start updating page list process ', dataObj, pageURL);

    for (let i = 0; i < dataObj.links.length; i++) {

        href = dataObj.links[i];

        if (/^\//.test(href)) {
            console.log('converting relative url ', href);

            href = domain + href;

            console.log('to absolute url ', href)
        };

        if (/\.fxstreet\./.test(href)) {

            console.log('url is from fxstreet', href);

            let linkNotExist = await webscrapper.collection('pageList').find({ "url": href }).length < 1;

            console.log('checking if url is on page list ', linkNotExist);

            if (linkNotExist) {

                console.log('Link does not exist. Saving it as not visited');

                await webscrapper.collection('pageList').insertOne({ url: href, visited: false });

            };

        };

    };

    let result = {};

    console.log('start counting instances of each class in page class list', dataObj);

    for (let i = 0; i < dataObj.classList.length; ++i) {

        console.log('loop through class list ', i);

        if (!result[dataObj.classList[i]]) {

            console.log('first instance of class on this page', dataObj.classList[i]);

            result[dataObj.classList[i]] = 0;

        };

        ++result[dataObj.classList[i]];

        console.log('updating count list on ', result[dataObj.classList[i]])
    }

    let classList = [];

    console.log('Start mounting final object classList attribute');

    for (const property in result) { classList.push({ className: property, appearances: result[property] }) }

    console.log('classList atribute mounted ', classList);

    console.log('updating page List with object', { url: pageURL, visited: true, classList: classList });

    webscrapper.collection('pageList').updateOne({ url: pageURL }, { visited: true, classList: classList });

    client.close();

    return true;

}

async function updateClassList(dataObj, pageURL) {

    console.log('Start updating class list process ', dataObj, pageURL);

    let { webscrapper, client } = await mongoConnect();

    for (let i = 0; i < dataObj.classList.length; i++) {

        let className = dataObj.classList[i];

        let classObject = await webscrapper.collection('classList').find({ "className": className });

        console.log('Cheching if className does not exist in collection ', classObject);

        if (classObject) {

            console.log('Class already exist, updating it',classObject);

            classObject.appearances++

            console.log('updating appearances count ', classObject.appearances);

            classObject.pages.push(pageURL);

            console.log('updating pages list ', classObject.pages);

            webscrapper.collection('classList').updateOne({ className: className }, { appearances: classObject.appearances, pages: classObject.pages });

        } else {

            console.log('Class does not exist on collection, saving it', { className: className, appearances: 1, pages: [pageURL] });

            webscrapper.collection('classList').insertOne({ className: className, appearances: 1, pages: [pageURL] });

        }

    };

    client.close();

    return true;

}

async function getClassObject(className) {

    let { webscrapper, client } = await mongoConnect();

    let classObject = await webscrapper.collection('classList').find({ "className": className }).toArray();

    client.close();

    console.log('getting class object ', classObject, ' from ', className);

    return classObject;

}

async function getClassList(pageURL) {

    let { webscrapper, client } = await mongoConnect();

    let pageObject = await webscrapper.collection('pageList').find({ "url": pageURL }).toArray();

    console.log('getting page object', pageObject, ' from ', pageURL);

    client.close();

    return pageObject;

}

module.exports.getNextPageNotVisited = getNextPageNotVisited;

module.exports.updatePageList = updatePageList;

module.exports.updateClassList = updateClassList;

module.exports.getClassObject = getClassObject;

module.exports.getClassList = getClassList;
