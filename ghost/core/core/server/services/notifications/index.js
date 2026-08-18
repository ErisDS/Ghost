const Notifications = require('./notifications');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

function init() {
    if (!instance) {
        const settingsCache = require('../../../shared/settings-cache');
        const models = require('../../models');

        instance = new Notifications({
            settingsCache,
            SettingsModel: models.Settings
        });
    }
}

const service = lazySingleton('NotificationsService', () => instance);

module.exports = {init, service};
