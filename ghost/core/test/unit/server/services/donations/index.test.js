const assert = require('node:assert/strict');

describe('Donations composition root', function () {
    let donations;

    beforeEach(function () {
        const modulePath = require.resolve('../../../../../core/server/services/donations');
        delete require.cache[modulePath];
        donations = require(modulePath);
    });

    it('fails loudly when the repository is used before initialization', function () {
        assert.throws(
            () => donations.service.create({}),
            /DonationRepository must be initialized before use/
        );
    });

    it('initializes idempotently', function () {
        donations.init();
        const prototype = Object.getPrototypeOf(donations.service);

        assert.equal(donations.init(), undefined);
        assert.equal(Object.getPrototypeOf(donations.service), prototype);
    });
});
