const DynamicRoutingService = require('./dynamic-routing-service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

function init() {
    if (!instance) {
        instance = new DynamicRoutingService();
    }

    const adapterManager = require('../adapter-manager').service;
    instance.configure({
        store: adapterManager.getAdapter('route-settings')
    });
}

const service = lazySingleton('RouteSettingsService', () => instance);

module.exports = {init, service};
