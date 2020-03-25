const express = require('express');
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function () {
    console.log('listening on 3000')
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.post('/pagesXclass', (req, res) => {
    console.log(req.body);
});
app.post('/classXpages', (req, res) => {
    console.log(req.body);
}); 
app.post('/classListAppearances', (req, res) => {
    console.log("return a class list with appearances");
});
