const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

const service = lazySingleton('EmailSuppressionList', () => instance);

async function init() {
    if (instance) {
        return;
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
}

module.exports = {init, service};
