const assert = require('node:assert/strict');

describe('Tinybird service composition root', function () {
    let tinybird;

    beforeEach(function () {
        const modulePath = require.resolve('../../../../../core/server/services/tinybird');
        delete require.cache[modulePath];
        tinybird = require(modulePath);
    });

    it('fails loudly when the service is used before initialization', function () {
        assert.throws(
            () => tinybird.service.getToken(),
            /TinybirdService must be initialized before use/
        );
    });

    it('is idempotent and returns null after unconfigured initialization', function () {
        tinybird.init();
        tinybird.init();

        assert.equal(tinybird.service.getToken(), null);
    });
});
