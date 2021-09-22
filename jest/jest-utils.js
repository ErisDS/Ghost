const supertest = require('supertest');

const boot = require('../core/boot');
const urlServiceUtils = require('../test/utils/url-service-utils');
const mail = require('../core/server/services/mail');
// const jest = require('jest');

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

module.exports.mockMail = () => {
    jest.spyOn(mail.GhostMailer.prototype, 'send').mockImplementation(() => {
        return new Promise((res) => {
            res('Mail is disabled');
        });
    });
};

module.exports.restoreAllMocks = () => {
    jest.restoreAllMocks();
};
