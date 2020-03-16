async function scrapPage() {

    let puppeteer = require('puppeteer');
    let psl = require('psl');
    let MongoClient = require('mongodb').MongoClient;

    let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    let db = client.db("webscrapper");

    let url = "mongodb://localhost:27017/";
    let URL = '';

    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    try {
        const res = await db.collection("urlsclasses").findOne({ visited: false });
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
                };
            };

            for (let i = 0; i < elements.length; i++) {
                for (let j = 0; j < elements[i].classList.length; j++) {
                    classes.add(elements[i].classList.item(j));
                };
            };

            await scrapPage();

        }, domain);
    }
    catch(err){
        console.log('All links visited');
        console.log(err);
    }
    finally {
        client.close();
    }
   
    await browser.close();
};

(async () => {
    await scrapPage();
})().catch(err => console.error(err));