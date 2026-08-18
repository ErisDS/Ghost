const stripeService = require('./service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

const instance = stripeService;
let initialized = false;
let initPromise;

async function init() {
    if (initialized) {
        return;
    }

    if (!initPromise) {
        initPromise = stripeService.init().then(() => {
            initialized = true;
        });
    }

    try {
        await initPromise;
    } catch (error) {
        initPromise = undefined;
        throw error;
    }
}

const service = lazySingleton('StripeService', () => instance);

module.exports = {init, service};
