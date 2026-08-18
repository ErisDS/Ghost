const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('JobService', () => instance);

function init() {
    if (instance) {
        return;
    }

    instance = require('./job-service');
}

module.exports = {init, service};
