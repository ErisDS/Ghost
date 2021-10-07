const supertest = require('supertest');

const boot = require('../core/boot');
const urlServiceUtils = require('../test/utils/url-service-utils');

const db = require('./utils/db.js');

let rootApp;

module.exports.getRequestAgent = async () => {
    rootApp = await boot({serverStart: false});

    await urlServiceUtils.isFinished();

    const agent = supertest(rootApp);
    return agent;
};

module.exports.resetDb = async () => {
    await db.teardown();
};

module.exports.mocks = require('./utils/mocks');
