async function scrapPages() {

    console.log('Ejecución de scrapPages.');

    console.log('Requerimos módulos utils, mongo y puppeteer. ');

    let { getNextPageNotVisited, updatePageList, updateClassList } = require('./mongo.js');
    let { scrapPage } = require('./puppeteer.js');

    let URL = await getNextPageNotVisited();

    console.log('Recogemos la URL de la primera página encontrada no visitada.', URL);

    let dataObj = await scrapPage(URL);

    console.log('sacamos las páginas y las clases de la URL ', URL);

    await updatePageList(dataObj, URL);

    console.log('guardamos las páginas desde ', dataObj);

    await updateClassList(dataObj, URL);

    console.log('guardamos las clases desde ', dataObj);

    console.log('Fin de scrap Pages', URL);

};
(async () => {
    await scrapPages();
})().catch(err => console.error(err));
