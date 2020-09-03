var request = require("request");
fs = require("fs");

var { getSiteClassList } = require("./mongo.js");

var css = [];
var regExp = /\.fxs_(.*?)[ \,\{\.\:\>]/gm;
var styleSheetClasses = [];
request.get(
  "https://staticcontent.fxstreet.com/website/css/fxs_screen.css",
  (error, response, body) => {
    if (!error && response.statusCode == 200) {
      styleSheetClasses = body.match(regExp);
      for (var i = 0; i < styleSheetClasses.length; i++) {
        var cssClass = styleSheetClasses[i]
          .replace(/[ ,.{:]/, "")
          .replace(/[ ,.{:>]/, "");
        styleSheetClasses[i] = cssClass;
      }
      var cssClassesSet = new Set(styleSheetClasses);
      styleSheetClasses = Array.from(cssClassesSet);
      styleSheetClasses.sort();
      (async () => {
        var siteClassList = await getSiteClassList();
        var notAppearingClasses = styleSheetClasses.filter(function (
          styleSheetClass
        ) {
          return !siteClassList.some(function (siteClass) {
            return styleSheetClass === siteClass.className;
          });
        });
        var textCSV = '';
        for (let i = 0; i < notAppearingClasses.length; i++) {
          textCSV += '<br/>' + notAppearingClasses[i];
          
        };
        fs.writeFile('notUsedClasses.html', textCSV, function (err) {
          if (err) return console.log(err);
          console.log('Not used Classes generated > notUsedClasses.html');
        });
      })().catch((err) => console.log(err));
    }
  }
);
