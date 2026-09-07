const {AutomationsService} = require('./service');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create(options) {
    if (instance) {
        return instance;
    }

    instance = new AutomationsService();
    instance.init(options);

    return instance;
}
const lifecycle = defineService({
    name: 'AutomationsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
