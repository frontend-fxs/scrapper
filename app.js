const puppeteer = require('puppeteer');
const fs = require('fs');
async function scrapPage(){
    let rawClassList = fs.readFileSync('classList.json');
    let classList = JSON.parse(rawClassList).classList;
    let inputClassList = new Set([...classList]);
    let rawURLs = fs.readFileSync('visitedURLs.json');
    let URLs = JSON.parse(rawURLs);
    let URLindex = URLs.findIndex(url => url.visited === false);
    if (URLindex === -1){
        console.log("All URLs visited");
        return;
    }
    let URL = URLs[URLindex].URL;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    const links = await page.evaluate(() => {
        var anchors = document.querySelectorAll('a');
        var elements = document.querySelectorAll('*');
        var links = new Set();
        var classes = new Set();
        for (let i = 0; i < anchors.length; i++) {
            let href = anchors[i].getAttribute("href");
            if (/^\//.test(href)) {
                href = "https://www.fxstreet.com" + href;
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
        return { classes: [...classes], links: [...links] };
    });
    URLs[URLindex].visited = true;
    URLs[URLindex].classList = links.classes;
    links.links.map(
        (link) => {
            found = URLs.some((link2) => { link2.URL === link });
            if (!found) {
                URLs.push({ "URL": link, visited: false })
            }
        }
    )
    URLs.sort(function (a, b) {
        return a.URL - b.URL;
    });
    let outputClassList = new Set([...links.classes,...inputClassList]);
    classList = [...outputClassList];
    classList.sort();
    let stringifiedClassList = JSON.stringify({ "classList": classList});
    fs.writeFileSync('classList.json', stringifiedClassList);
    let stringifiedURLs = JSON.stringify(URLs);
    fs.writeFileSync('visitedURLs.json', stringifiedURLs);
    await browser.close();
    await scrapPage();
};

(async()=>{
    await scrapPage();
})();