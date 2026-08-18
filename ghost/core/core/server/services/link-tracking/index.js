const LinkTrackingServiceWrapper = require('./link-tracking-service-wrapper');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

async function init() {
    if (instance) {
        return;
    }

    if (!initPromise) {
        const linkTrackingService = new LinkTrackingServiceWrapper();
        initPromise = linkTrackingService.init().then(() => {
            instance = linkTrackingService;
        });
    }

    try {
        await initPromise;
    } catch (error) {
        initPromise = undefined;
        throw error;
    }
}

const service = lazySingleton('LinkTrackingService', () => instance);

module.exports = {init, service};
