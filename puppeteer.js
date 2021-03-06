async function getPuppeteerPage() {
    let puppeteer = require('puppeteer');
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    return {page,browser};
}
async function scrapPage(URL) {
    let { page, browser } = await getPuppeteerPage(); 
    await page.goto(URL, { waitUntil: 'domcontentloaded' }).catch(error => error);
    let dataObj = await page.evaluate(() => {
        let anchors = document.querySelectorAll('a');
        let elements = document.querySelectorAll('*');
        let links = new Set();
        let classList = [];
        for (let i = 0; i < anchors.length; i++) {
            let href = anchors[i].getAttribute("href");
            links.add(href);
        }
        for (let i = 0; i < elements.length; i++) {
            for (let j = 0; j < elements[i].classList.length; j++) {
                let className = elements[i].classList.item(j);
                classList.push(className);
            }
        }
        return { links: [...links], classList: [...classList] };
    });
    await browser.close();
    return dataObj;
}
module.exports.scrapPage = scrapPage;