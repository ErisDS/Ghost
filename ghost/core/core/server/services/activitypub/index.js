const {ActivityPubService} = require('./activity-pub-service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let enabled = false;

const service = lazySingleton('ActivityPubService', () => instance);

async function init() {
    if (instance) {
        return;
    }

    const logging = require('@tryghost/logging');
    const events = require('../../lib/common/events');
    const {knex} = require('../../data/db');
    const urlUtils = require('../../../shared/url-utils').default;
    const identityTokens = require('../identity-tokens');
    const settingsCache = require('../../../shared/settings-cache');

    instance = new ActivityPubService(
        knex,
        new URL(urlUtils.getSiteUrl()),
        logging,
        identityTokens.service
    );

    async function configureActivityPub() {
        if (settingsCache.get('social_web_enabled')) {
            if (!enabled) {
                await instance.enable();
                enabled = true;
            }
        } else if (enabled) {
            await instance.disable();
            enabled = false;
        }
    }

    events.on('settings.labs.edited', configureActivityPub);
    events.on('settings.social_web.edited', configureActivityPub);
    events.on('settings.is_private.edited', configureActivityPub);

    configureActivityPub();
}

module.exports = {
    init,
    service
};
