const assert = require('node:assert/strict');

describe('Announcement bar composition root', function () {
    let announcementBar;

    beforeEach(function () {
        const modulePath = require.resolve('../../../../../core/server/services/announcement-bar-service');
        delete require.cache[modulePath];
        announcementBar = require(modulePath);
    });

    it('fails loudly when the service is used before initialization', function () {
        assert.throws(
            () => announcementBar.service.getAnnouncementSettings(),
            /AnnouncementBarSettings must be initialized before use/
        );
    });

    it('initializes idempotently', function () {
        announcementBar.init();
        const firstService = announcementBar.service;

        announcementBar.init();

        assert.equal(announcementBar.service, firstService);
        assert.doesNotThrow(() => announcementBar.service.getAnnouncementSettings());
    });
});
