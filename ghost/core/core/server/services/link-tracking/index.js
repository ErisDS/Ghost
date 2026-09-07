const LinkTrackingServiceWrapper = require('./link-tracking-service-wrapper');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;
let initPromise;

async function create() {
    if (instance) {
        return instance;
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

    return instance;
}
const lifecycle = defineService({
    name: 'LinkTrackingService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
