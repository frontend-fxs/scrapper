let { getPageList,getClassList } = require('./mongo.js');
const ObjectsToCsv = require('objects-to-csv');

(async () => {
    let pageList = await getPageList();
    const pageListCSV = new ObjectsToCsv(pageList);
    await pageListCSV.toDisk('./pageList.csv');
    let classList = await getClassList();
    for (let i = 0;  i < classList.length; i++) {
      let row = [{ className:classList[i].className , appearances: classList[i].appearances}];
      await new ObjectsToCsv(row).toDisk('./classList.csv', { append: true });
    }

  })();