const EmailServiceWrapper = require('./email-service-wrapper');
const {lazySingleton} = require('../../../shared/lazy-singleton');

const instance = new EmailServiceWrapper();
let initialized = false;

function init(options) {
    if (!initialized) {
        instance.init(options);
        initialized = true;
    }
}

const service = lazySingleton('EmailService', () => instance);

module.exports = {init, service};
