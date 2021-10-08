const jestUtils = require('../../../jest-utils');

let agent;

describe('Test the site path', function () {
    beforeAll(async function () {
        agent = await jestUtils.getAgent('/ghost/api/canary/admin');
    });

    test('GET /site/', async function () {
        await agent
            .get('/site/')
            .expect((response) => {
                expect(response.body).toMatchSnapshot({
                    site: {
                        version: expect.stringMatching(/\d+\.\d+/)
                    }

                });

                expect(response.headers).toMatchHeaderSnapshot();
            })
            .expect(200);
    });
});
