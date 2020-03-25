async function scrapPages() {

    console.log('Ejecución de scrapPages.');

    let { extractHostname } = require('./utils.js');
    let { getNextPageNotVisited, savePageList, saveClassList } = require('./mongo.js');
    let { scrapPage } = require('./puppeteer.js');

    console.log('Requerimos módulos utils, mongo y puppeteer. ');

    let URL = await getNextPageNotVisited();

    console.log('Recogemos la URL de la primera página encontrada no visitada.', URL);

    let domain = extractHostname(URL);

    console.log('Extraemos el dominio de la URL', domain);

    let dataObj = await scrapPage(URL);

    console.log('sacamos las páginas y las clases');

    await savePageList(dataObj);

    console.log('guardamos las páginas');

    await saveClassList(dataObj);

    console.log('guardamos las clases');

};
(async () => {
    await scrapPages();
})().catch(err => console.error(err));
