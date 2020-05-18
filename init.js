let { init } = require('./mongo.js');
(async () => {
    await init();
})().catch(err => console.log(err));
