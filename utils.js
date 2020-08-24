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
    console.log('domain: ',domain);
    return domain;
}
module.exports.extractHostname = extractHostname;
