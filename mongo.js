var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("webscrapper");
    dbo.collection("urlsclasses").findOne({}, function (err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    }); 
    dbo.collection("classes").findOne({}, function (err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
});