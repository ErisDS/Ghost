const {agentProvider, fixtureManager, mockManager, matchers} = require('../../utils/e2e-framework');
const {anyObjectId, anyISODateTime, anyString} = matchers;

const matchRoutesShallowIncludes = {
    id: anyObjectId,
    source: anyString,
    target: anyString,
    timestamp: anyISODateTime,
    source_title: anyString
};

describe('Routes API', function () {
    let agent;

    before(async function () {
        agent = await agentProvider.getAdminAPIAgent();
        await fixtureManager.init('users');
        await agent.loginAsOwner();
    });

    afterEach(function () {
        mockManager.restore();
    });

    it('Can browse with limits', async function () {
        const res = await agent.get('routes/?limit=2')
            .expectStatus(200)
            .matchBodySnapshot({
                routes: []
            });
    });
});
