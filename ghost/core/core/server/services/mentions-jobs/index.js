const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    instance = require('./job-service');

    return instance;
}
const lifecycle = defineService({
    name: 'MentionsJobService',
    create,
    retainInstance: true,
    reinitialize: true,
    stop(jobManager) {
        return jobManager.shutdown();
    }
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
