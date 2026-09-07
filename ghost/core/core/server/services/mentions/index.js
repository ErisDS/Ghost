const mentionsService = require('./service');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;
let initPromise;

async function create() {
    if (instance) {
        return instance;
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

    return instance;
}
const lifecycle = defineService({
    name: 'MentionsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
