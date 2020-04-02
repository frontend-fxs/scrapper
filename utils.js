function extractHostname(url){

    let psl = require('psl');

    var hostname;

    console.log('inside extractHostname parameter url ', url);

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
module.exports.extractHostname = extractHostname;