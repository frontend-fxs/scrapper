let { setPageAsVisited } = require('./mongo.js');
(async () => {
    await setPageAsVisited('https://www.fxstreet.de.com/news/eur-usd-konsolidierung-bleibt-kurzfristig-intakt-uob-202008270809');
})().catch(err => console.log(err));
