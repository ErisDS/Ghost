const EmailServiceWrapper = require('./email-service-wrapper');
const {defineService} = require('../../../shared/service-lifecycle');

const instance = new EmailServiceWrapper();
let initialized = false;

function create(options) {
    if (!initialized) {
        instance.init(options);
        initialized = true;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'EmailService',
    create,
    stableInstance: instance,
    reinitialize: true
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
