const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.fxstreet.com/', { waitUntil: 'domcontentloaded' });
    
    const links = await page.evaluate(()=>{
        var anchors =  document.querySelectorAll('a');
        var elements = document.querySelectorAll('*');
        var links = new Set();
        var classes = new Set();
        for(let i = 0; i <anchors.length;i++){
            let href = anchors[i].getAttribute("href");
            if (/^\//.test(href)){
                href = "https://www.fxstreet.com"+href;
            };
            if(/\.fxstreet\./.test(href)){
                links.add(href);
            };
        };
        for (let i = 0; i < elements.length; i++){
            for (let j = 0; j < elements[i].classList.length;j++) {
                classes.add(elements[i].classList.item(j));
            };
        };
        return {classes:[...classes],links:[...links]};
    });

    console.log(links);

    await browser.close();
})();