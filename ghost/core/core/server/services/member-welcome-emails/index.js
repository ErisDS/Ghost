const memberWelcomeEmailService = require('./service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

function init() {
    if (!instance) {
        memberWelcomeEmailService.init();
        instance = memberWelcomeEmailService;
    }
}

const service = lazySingleton('MemberWelcomeEmailService', () => instance);

module.exports = {init, service};
