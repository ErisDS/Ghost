const settingsService = require('./settings-service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

const instance = settingsService;
let initPromise;

async function init() {
    if (!initPromise) {
        initPromise = settingsService.init();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }
}

const service = lazySingleton('SettingsService', () => instance);

module.exports = {init, service};
