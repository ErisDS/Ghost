const supertest = require('supertest');

const boot = require('../core/boot');
const urlServiceUtils = require('../test/utils/url-service-utils');

let ghostServer;

module.exports.getRequestAgent = async () => {
    ghostServer = await boot();
    await urlServiceUtils.isFinished();

    const agent = supertest(ghostServer.rootApp);
    return agent;
};

module.exports.shutdown = async () => {
    await ghostServer.shutdown();
};
