let { reset,init } = require('./mongo.js');
(async () => {
    await reset();
    await init();
})().catch(err => console.log(err));
