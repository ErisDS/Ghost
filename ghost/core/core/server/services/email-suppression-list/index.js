const {defineService} = require('../../../shared/service-lifecycle');

let instance;
let initPromise;

async function create() {
    if (instance) {
        return instance;
    }

    if (!initPromise) {
        initPromise = (async () => {
            const models = require('../../models');
            const config = require('../../../shared/config');
            const settingsCache = require('../../../shared/settings-cache');
            const MailgunClient = require('../lib/mailgun-client');
            const MailgunEmailSuppressionList = require('./mailgun-email-suppression-list');

            const candidate = new MailgunEmailSuppressionList({
                Suppression: models.Suppression,
                apiClient: new MailgunClient({config, settings: settingsCache})
            });

            await candidate.init();
            instance = candidate;
        })();
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
    name: 'EmailSuppressionList',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
