const jestUtils = require('../../../jest-utils');

const API_URL = '/ghost/api/canary/admin';

let agent;

describe('Test the site path', () => {
    beforeAll(async () => {
        agent = await jestUtils.getAgent(API_URL);
    });

    test('GET /site/', async () => {
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
