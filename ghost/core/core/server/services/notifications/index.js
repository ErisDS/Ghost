const Notifications = require('./notifications');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (!instance) {
        const settingsCache = require('../../../shared/settings-cache');
        const models = require('../../models');

        instance = new Notifications({
            settingsCache,
            SettingsModel: models.Settings
        });
    }

    return instance;
}
const lifecycle = defineService({
    name: 'NotificationsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
