const assert = require('node:assert/strict');

describe('Milestones Service', function () {
    let milestonesService;

    it('Provides expected public API', async function () {
        const milestones = require('../../../../../core/server/services/milestones');
        await milestones.init();
        milestonesService = milestones.service;

        assert.ok(milestonesService.initAndRun);
    });
});
