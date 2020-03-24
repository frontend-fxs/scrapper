async function scrapPage() {
    let puppeteer = require('puppeteer');
    let psl = require('psl');
    let MongoClient = require('mongodb').MongoClient;
    let extractHostname = require('extractHostname');
    let url = "mongodb://localhost:27017/";
    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let webscrapper = client.db("webscrapper");
    let URL = '';
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    
    try {
        const res = await webscrapper.collection("urlsclasses").findOne({ visited: false });
        URL = res.url;
        let domain = psl.get(extractHostname(URL));
        await page.goto(URL, { waitUntil: 'domcontentloaded' });
        await page.evaluate((domain) => {
            let anchors = document.querySelectorAll('a');
            let elements = document.querySelectorAll('*');
            let links = new Set();
            let classes = new Set();
            for (let i = 0; i < anchors.length; i++) {
                let href = anchors[i].getAttribute("href");
                if (/^\//.test(href)) {
                    href = domain + href;
                };
                if (/\.fxstreet\./.test(href)) {
                    links.add(href);
                    let linkNotExist = webscrapper.collection('urlsclasses').find({ "url": href }).length < 1;
                    if (linkNotExist) {
                        webscrapper.collection('urlsclasses').insertOne({ url: href, visited: false });
                    };
                };
            };
            for (let i = 0; i < elements.length; i++) {
                for (let j = 0; j < elements[i].classList.length; j++) {
                    let className = elements[i].classList.item(j);
                    classes.add(className);
                    let classNotExist = webscrapper.collection('classes').find({ "className": className }).length < 1;
                    if (classNotExist) {
                        webscrapper.collection('classes').insertOne({ className: className });
                    };
                };
            };
            webscrapper.collection('urlsclasses').insertOne({ url: URL, visited: true, classes: [...classes] });
            scrapPage();
        }, domain);
    } catch (err) {
        console.log('All links visited');
        console.log(err);
    } finally {
        client.close();
    };
    await browser.close();
};
(async () => {
    await scrapPage();
})().catch(err => console.error(err));
