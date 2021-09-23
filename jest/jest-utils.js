const supertest = require('supertest');

const boot = require('../core/boot');
const urlServiceUtils = require('../test/utils/url-service-utils');
const mail = require('../core/server/services/mail');
// const jest = require('jest');

let rootApp;

module.exports.getRequestAgent = async () => {
    rootApp = await boot({serverStart: false});

    console.log('got rootApp', rootApp);
    await urlServiceUtils.isFinished();

    console.log('urlservice finished');

    const agent = supertest(rootApp);
    return agent;
};

module.exports.shutdown = async () => {
    // Hmm... how to shutdown the db ?
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
