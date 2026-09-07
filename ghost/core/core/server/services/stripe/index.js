const stripeService = require('./service');
const {defineService} = require('../../../shared/service-lifecycle');

const instance = stripeService;
let initPromise;

async function create() {
    if (!initPromise) {
        initPromise = stripeService.init();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'StripeService',
    create,
    stableInstance: instance,
    reinitialize: true
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
