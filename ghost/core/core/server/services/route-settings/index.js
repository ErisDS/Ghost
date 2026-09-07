const DynamicRoutingService = require('./dynamic-routing-service');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (!instance) {
        instance = new DynamicRoutingService();
    }

    const adapterManager = require('../adapter-manager').service;
    instance.configure({
        store: adapterManager.getAdapter('route-settings')
    });

    return instance;
}
const lifecycle = defineService({
    name: 'RouteSettingsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
