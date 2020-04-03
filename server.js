const express = require('express');
const bodyParser = require('body-parser')
const app = express();
let { getClassList, getEntireClassList, getPageList, getEntirePageList} = require('./mongo.js');

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('listening on 3000')
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.post('/getClassList', async (className, res) => {
    let classList = await getClassList(className.body.class).catch((error) => { console.log(error); });
    res.render('getClassList.ejs', { classList: classList })
});
app.post('/getEntireClassList', async (req, res) => {
    let classList = await getEntireClassList().catch((error) => { console.log(error); });
    res.render('getEntireClassList.ejs', { classList: classList});
});
app.post('/getPageList', async (pageURL, res) => {
    let pageList = await getPageList(pageURL.body.page).catch((error)=>{console.log(error);});
    res.render('getPageList.ejs', { pageList: pageList });
});
app.post('/getEntirePageList', async (pageURL, res) => {
    let { pageList: pageList, count: count } = await getEntirePageList().catch((error) => { console.log(error); });
    res.render('getEntirePageList.ejs', { pageList: pageList, count: count });
});