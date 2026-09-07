const memberWelcomeEmailService = require('./service');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (!instance) {
        memberWelcomeEmailService.init();
        instance = memberWelcomeEmailService;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'MemberWelcomeEmailService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
