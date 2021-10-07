const supertest = require('supertest');

const boot = require('../core/boot');
const urlServiceUtils = require('../test/utils/url-service-utils');
const mail = require('../core/server/services/mail');

// const jest = require('jest');
// const dbUtils = require('../test/utils/db-utils');
const db = require('./utils/db.js');

let rootApp;

module.exports.getRequestAgent = async () => {
    rootApp = await boot({serverStart: false});

    await urlServiceUtils.isFinished();

    const agent = supertest(rootApp);
    return agent;
};

module.exports.shutdown = async () => {
    await db.teardown();
};

module.exports.mockMail = () => {
    return jest.spyOn(mail.GhostMailer.prototype, 'send').mockImplementation(() => {
        return new Promise((res) => {
            res('Mail is disabled');
        });
    });
};

module.exports.restoreAllMocks = () => {
    jest.restoreAllMocks();
};
