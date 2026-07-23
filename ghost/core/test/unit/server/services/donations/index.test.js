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
            () => donations.getRepository(),
            /Donation repository must be initialized before use/
        );
    });

    it('returns the same repository from repeated initialization', function () {
        const repository = donations.init();

        assert.equal(donations.init(), repository);
        assert.equal(donations.getRepository(), repository);
    });
});
