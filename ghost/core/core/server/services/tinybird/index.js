const TinybirdService = require('./tinybird-service');
const {defineService} = require('../../../shared/service-lifecycle');

const lifecycle = defineService({
    name: 'TinybirdService',
    create() {
        const config = require('../../../shared/config');
        const settingsCache = require('../../../shared/settings-cache');
        const logging = require('@tryghost/logging');

        const tinybirdConfig = config.get('tinybird');
        const siteUuid = settingsCache.get('site_uuid');

        if (!tinybirdConfig || !siteUuid) {
            logging.warn('Tinybird service not configured');
        }

        return new TinybirdService({
            tinybirdConfig,
            getTinybirdConfig: () => config.get('tinybird'),
            siteUuid
        });
    }
});

module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
