const express = require('express');
const bodyParser = require('body-parser')
const app = express();
let mongo = require('./mongo.js');

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('listening on 3000')
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.post('/classPageList', (req, res) => {
    console.log(req.body);
});
app.post('/pageClassList', (req, res) => {
    res.render('index.ejs', { quotes: result })
});
