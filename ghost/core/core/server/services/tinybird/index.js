const TinybirdService = require('./tinybird-service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('TinybirdService', () => instance);

function init() {
    if (instance) {
        return;
    }

    const config = require('../../../shared/config');
    const settingsCache = require('../../../shared/settings-cache');
    const logging = require('@tryghost/logging');

    const tinybirdConfig = config.get('tinybird');
    const siteUuid = settingsCache.get('site_uuid');

    if (!tinybirdConfig || !siteUuid) {
        logging.warn('Tinybird service not configured');
    }

    instance = new TinybirdService({
        tinybirdConfig,
        siteUuid
    });
}

module.exports = {
    init,
    service
};
