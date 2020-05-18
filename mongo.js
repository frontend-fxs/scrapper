async function mongoConnect() {
  let MongoClient = require("mongodb").MongoClient;
  let url = "mongodb://localhost:27017/";
  let client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let webscrapper = client.db("webscrapper");
  return { webscrapper: webscrapper, client: client };
}
async function reset() {
  let { webscrapper, client } = await mongoConnect();
  await webscrapper.collection("pageList").drop();
  await webscrapper.collection("classList").drop();
  client.close();
  return true;
}
async function init() {
  let { webscrapper, client } = await mongoConnect();
  await webscrapper.createCollection("pageList");
  await webscrapper
    .collection("pageList")
    .insertOne({ url: "https://www.fxstreet.com", visited: false });
  await webscrapper.createCollection("classList");
  await extractClassNamesFromSiteStylesheet();
  client.close();
  return true;
}
async function extractClassNamesFromSiteStylesheet() {
  let { webscrapper, client } = await mongoConnect();
  let { extractStylesheetClassNames } = require("./utils");
  classArray = extractStylesheetClassNames();
  for (let i = 0; i < classArray.length; i++) {
    let className = classArray[i];
    let exist = await webscrapper
      .collection("classList")
      .findOne({ className: className });
    if (!exist) {
      await webscrapper
        .collection("classList")
        .insertOne({ className: className, appearances: 0, pages: [] });
    }
  }
  client.close();
  return true;
}
async function getNextPageNotVisited() {
  let { webscrapper, client } = await mongoConnect();
  let res = await webscrapper
    .collection("pageList")
    .findOne({ visited: false });
  client.close();
  console.log(new Date(), res);
  return res.url;
}
async function updatePageList(dataObj, pageURL) {
  let { extractHostname } = require("./utils.js");
  let { webscrapper, client } = await mongoConnect();
  let domain = extractHostname(pageURL);
  for (let i = 0; i < dataObj.links.length; i++) {
    href = dataObj.links[i];
    if (href) {
      if (/^\//.test(href)) {
        href = domain + href;
      }
      if (href.includes("?")) {
        href = href.slice(0, href.indexOf("?"));
      }
      if (href.includes("#")) {
        href = href.slice(0, href.indexOf("#"));
      }
      if (/^https\:\/\/(www|pt|ar)\.fxstreet\./i.test(href)) {
        let link = await webscrapper
          .collection("pageList")
          .findOne({ url: href });
        if (!link) {
          await webscrapper
            .collection("pageList")
            .insertOne({ url: href, visited: false });
        }
      }
    }
  }
  await webscrapper
    .collection("pageList")
    .updateOne({ url: pageURL }, { $set: { visited: true } }, { upsert: true });
  client.close();
  return true;
}
async function updateClassList(dataObj, pageURL) {
  let { webscrapper, client } = await mongoConnect();
  for (let i = 0; i < dataObj.classList.length; i++) {
    let className = dataObj.classList[i];
    let classObject = await webscrapper
      .collection("classList")
      .findOne({ className: className });
    if (classObject) {
      classObject.appearances++;
      if (!classObject.pages || !classObject.pages.includes(pageURL)) {
        classObject.pages.push(pageURL);
      }
      await webscrapper.collection("classList").updateOne(
        { className: className },
        {
          $set: {
            appearances: classObject.appearances,
            pages: classObject.pages,
          },
        },
        { upsert: true }
      );
    } else {
      await webscrapper
        .collection("classList")
        .insertOne({ className: className, appearances: 1, pages: [pageURL] });
    }
  }
  client.close();
  return true;
}
async function getScrapedData() {
  let { webscrapper, client } = await mongoConnect();
  let totalPagesCount = await webscrapper
    .collection("pageList")
    .find({})
    .count();
  let remainPagesCount = await webscrapper
    .collection("pageList")
    .find({ visited: false })
    .count();
  let totalClassesCount = await webscrapper
    .collection("classList")
    .find({})
    .count();
  let notUsedClassesCount = await webscrapper
    .collection("classList")
    .find({ appearances: 0 })
    .count();
  client.close();
  return {
    totalPagesCount: totalPagesCount,
    remainPagesCount: remainPagesCount,
    totalClassesCount: totalClassesCount,
    notUsedClassesCount: notUsedClassesCount,
  };
}
async function getPageList() {
  let { webscrapper, client } = await mongoConnect();
  let pageList = await webscrapper
    .collection("pageList")
    .find({})
    .toArray()
    .catch((error) => console.log(error));
  client.close();
  return pageList;
}
async function getClassList() {
  let { webscrapper, client } = await mongoConnect();
  let classListUnsorted = await webscrapper
    .collection("classList")
    .find({})
    .toArray()
    .catch((error) => console.log(error));
  client.close();
  let classListSortedByClassName = classListUnsorted.sort((a, b) => {
    if (a.className > b.className) {
      return -1;
    }
    if (b.className > a.className) {
      return 1;
    }
    return 0;
  });
  let classList = classListSortedByClassName.sort((a, b) => {
    if (a.appearances > b.appearances) {
      return 1;
    }
    if (b.appearances > a.appearances) {
      return -1;
    }
    return 0;
  });
  return classList;
}
module.exports.reset = reset;
module.exports.init = init;
module.exports.getNextPageNotVisited = getNextPageNotVisited;
module.exports.updatePageList = updatePageList;
module.exports.updateClassList = updateClassList;
module.exports.getScrapedData = getScrapedData;
module.exports.getClassList = getClassList;
module.exports.getPageList = getPageList;
