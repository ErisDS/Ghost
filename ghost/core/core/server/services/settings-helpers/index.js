const SettingsHelpers = require('./settings-helpers');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const settingsCache = require('../../../shared/settings-cache');
    const urlUtils = require('../../../shared/url-utils').default;
    const config = require('../../../shared/config');
    const labs = require('../../../shared/labs');
    const limitService = require('../limits');

    instance = new SettingsHelpers({settingsCache, urlUtils, config, labs, limitService});

    return instance;
}
const lifecycle = defineService({
    name: 'SettingsHelpers',
    create,
    retainInstance: true
});


module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
