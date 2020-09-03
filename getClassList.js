let { getClassList } = require('./mongo.js');
(async()=>{
    let classList = await getClassList().catch((error) => { console.log(error); });
    console.log(classList);
})