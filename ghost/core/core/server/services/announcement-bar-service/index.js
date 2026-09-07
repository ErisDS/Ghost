const AnnouncementBarSettings = require('./announcement-bar-settings');
const {defineService} = require('../../../shared/service-lifecycle');

const lifecycle = defineService({
    name: 'AnnouncementBarSettings',
    create() {
        const settingsCache = require('../../../shared/settings-cache');

        return new AnnouncementBarSettings({
            getAnnouncementSettings: () => ({
                announcement: settingsCache.get('announcement_content'),
                announcement_background: settingsCache.get('announcement_background'),
                announcement_visibility: settingsCache.get('announcement_visibility')
            })
        });
    }
});

module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
