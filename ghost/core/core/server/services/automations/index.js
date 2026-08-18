const {AutomationsService} = require('./service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('AutomationsService', () => instance);

function init(options) {
    if (instance) {
        return;
    }

    instance = new AutomationsService();
    instance.init(options);
}

module.exports = {init, service};
