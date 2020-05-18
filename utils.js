function extractHostname(url){
    let psl = require('psl');
    var hostname;
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    let domain = psl.get(hostname);
    return domain;
}

function extractStylesheetClassNames(){
    const fs = require('fs');
    const data =  fs.readFileSync('./stylesheet.txt', 'utf8');
    const classArray = data.match(/(\.)(\D)([a-zA-Z0-9_-]+)([\.\s\[\:\,\>\)\+\{\r\n])/gm);
    const trimmedClassArray = classArray.map((item)=>{
        return item.replace(/\.|\s|\[|\:|\,|\>|\)|\+|\{|\r\n/g , '')
    });
    const uniqueClassSet = new Set(trimmedClassArray);
    return [...uniqueClassSet];
}
module.exports.extractHostname = extractHostname;
module.exports.extractStylesheetClassNames = extractStylesheetClassNames;