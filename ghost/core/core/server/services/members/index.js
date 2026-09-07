const {defineService} = require('../../../shared/service-lifecycle');

// Members still exposes a small set of static collaborators before boot
// (content gating and API test seams). Keep that legacy object stable while
// init() remains the only place that performs runtime initialization.
const instance = require('./service');
let initPromise;

async function create() {
    if (!initPromise) {
        initPromise = instance.init();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'MembersService',
    create,
    stableInstance: instance,
    reinitialize: true
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
