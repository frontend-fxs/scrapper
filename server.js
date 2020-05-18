const express = require('express');
const bodyParser = require('body-parser')
const app = express();
let { getScrapedData, getClassList } = require('./mongo.js');

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('listening on 3000')
});

app.get('/', async (req, res) => {
    let data = await getScrapedData().catch((error) => { console.log(error); });
    let classList = await getClassList().catch((error) => { console.log(error); });
    res.render('index.ejs', {data:data,classList:classList});
});