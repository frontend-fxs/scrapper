async function scrapPage() {
    let puppeteer = require('puppeteer');
    let psl = require('psl');
    let MongoClient = require('mongodb').MongoClient;
    let extractHostname = require('./utils.js').extractHostname;
    let url = "mongodb://localhost:27017/";
    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let webscrapper = client.db("webscrapper");
    let URL = '';
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    page.on('console', consoleObj => console.log(consoleObj.text()));
    const res = await webscrapper.collection("urlsclasses").findOne({ visited: false });
    URL = res.url;
    let domain = psl.get(extractHostname(URL));

    try {

        await page.goto(URL, { waitUntil: 'domcontentloaded' });

        let dataObj = await page.evaluate(() => {

            let anchors = document.querySelectorAll('a');
            let elements = document.querySelectorAll('*');
            let links = new Set();
            let classes = new Set();

            for (let i = 0; i < anchors.length; i++) {
                let href = anchors[i].getAttribute("href");
                links.add(href);
            }

            for (let i = 0; i < elements.length; i++) {
                for (let j = 0; j < elements[i].classList.length; j++) {
                    let className = elements[i].classList.item(j);
                    classes.add(className);
                }
            }
            return {links:[...links],classes:[...classes]};
        });
        
        for (let i = 0; i < dataObj.links.length;i++){
            
            href = dataObj.links[i];

            if (/^\//.test(href)) {
                href = domain + href;
            };
            if (/\.fxstreet\./.test(href)) {
                let linkNotExist = webscrapper.collection('urlsclasses').find({ "url": href }).length < 1;
                if (linkNotExist) {
                    webscrapper.collection('urlsclasses').insertOne({ url: href, visited: false });
                };
            };
        };
        webscrapper.collection('urlsclasses').insertOne({ url: URL, visited: true, classes: [...dataObj.classes] });
        scrapPage();
        for (let i = 0; i < dataObj.classes.length;i++){
            let className = dataObj.classes[i];
            let classNotExist = webscrapper.collection('classes').find({ "className": className }).length < 1;
            if (classNotExist) {
                webscrapper.collection('classes').insertOne({ className: className });
            };
        }
        
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.close();
    };
    await browser.close();

};
(async () => {
    await scrapPage();
})().catch(err => console.error(err));
