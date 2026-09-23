const stripeService = require('./service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

const instance = stripeService;
let initPromise;

async function init() {
    if (!initPromise) {
        initPromise = stripeService.init();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }
}

const service = lazySingleton('StripeService', () => instance);

module.exports = {init, service};
