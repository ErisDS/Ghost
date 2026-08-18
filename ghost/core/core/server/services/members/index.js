const {lazySingleton} = require('../../../shared/lazy-singleton');

// Members still exposes a small set of static collaborators before boot
// (content gating and API test seams). Keep that legacy object stable while
// init() remains the only place that performs runtime initialization.
const instance = require('./service');
let initialized = false;
let initPromise;

const service = lazySingleton('MembersService', () => instance);

async function init() {
    if (initialized) {
        return;
    }

    if (!initPromise) {
        initPromise = (async () => {
            await instance.init();
            initialized = true;
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
