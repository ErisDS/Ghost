const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('MentionsJobService', () => instance);

function init() {
    if (instance) {
        return;
    }

    instance = require('./job-service');
}

module.exports = {init, service};
