const settingsService = require('./settings-service');
const {defineService} = require('../../../shared/service-lifecycle');

const instance = settingsService;
let initPromise;

async function create() {
    if (!initPromise) {
        initPromise = settingsService.init();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'SettingsService',
    create,
    stableInstance: instance,
    reinitialize: true
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
