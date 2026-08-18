const {lazySingleton} = require('../../../shared/lazy-singleton');

// Members still exposes a small set of static collaborators before boot
// (content gating and API test seams). Keep that legacy object stable while
// init() remains the only place that performs runtime initialization.
const instance = require('./service');
let initPromise;

const service = lazySingleton('MembersService', () => instance);

async function init() {
    if (!initPromise) {
        initPromise = instance.init();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }
}

module.exports = {init, service};
