const mentionsService = require('./service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

async function init() {
    if (instance) {
        return;
    }

    if (!initPromise) {
        initPromise = mentionsService.init().then(() => {
            instance = mentionsService;
        });
    }

    try {
        await initPromise;
    } catch (error) {
        initPromise = undefined;
        throw error;
    }
}

const service = lazySingleton('MentionsService', () => instance);

module.exports = {init, service};
