const SettingsHelpers = require('./settings-helpers');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('SettingsHelpers', () => instance);

function init() {
    if (instance) {
        return;
    }

    const settingsCache = require('../../../shared/settings-cache');
    const urlUtils = require('../../../shared/url-utils').default;
    const config = require('../../../shared/config');
    const labs = require('../../../shared/labs');
    const limitService = require('../limits');

    instance = new SettingsHelpers({settingsCache, urlUtils, config, labs, limitService});
}

module.exports = {
    init,
    service
};
