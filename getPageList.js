let { getPageList } = require('./mongo.js');
(async () => {
    let pageList= await getPageList();
    console.log(pageList);
})().catch(err => console.log(err));