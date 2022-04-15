const {agentProvider, fixtureManager, matchers} = require('../../utils/e2e-framework');
const {anyObjectId, anyISODateTime, anyErrorId, anyEtag, anyLocationFor} = matchers;

describe('Posts API', function () {
    let agent;

    before(async function () {
        agent = await agentProvider.getAdminAPIAgent();
        await fixtureManager.init();
        await agent.loginAsOwner();
    });

    it('Can add', async function () {
        const newPost = {
            title: 'My post',
            status: 'draft'
        };

        const makePost = async () => {
            return agent
                .post('posts')
                .body({
                    posts: [newPost]
                })
                .expectStatus(201);
        };

        await Promise.all([makePost(), makePost()]);
    });
});
