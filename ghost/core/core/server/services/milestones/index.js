const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

const service = lazySingleton('MilestonesService', () => instance);

async function init() {
    if (instance) {
        return;
    }

    if (!initPromise) {
        initPromise = (async () => {
            const milestonesService = require('./service');
            await milestonesService.init();
            instance = milestonesService;
        })();
    }

    try {
        await initPromise;
    } catch (error) {
        initPromise = undefined;
        throw error;
    }
}

module.exports = {init, service};
