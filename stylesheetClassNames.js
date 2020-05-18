let { extractStylesheetClassNames } = require('./utils');

(async ()=>{
    extractStylesheetClassNames();
})().catch(err => console.log(err));