const AnnouncementBarSettings = require('./announcement-bar-settings');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('AnnouncementBarSettings', () => instance);

function init() {
    if (instance) {
        return;
    }

    const settingsCache = require('../../../shared/settings-cache');

    instance = new AnnouncementBarSettings({
        getAnnouncementSettings: () => ({
            announcement: settingsCache.get('announcement_content'),
            announcement_background: settingsCache.get('announcement_background'),
            announcement_visibility: settingsCache.get('announcement_visibility')
        })
    });
}

module.exports = {
    init,
    service
};
