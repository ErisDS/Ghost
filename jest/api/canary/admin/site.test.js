const supertest = require('supertest');
const testUtils = require('../../../../test/utils/');
const config = require('../../../../core/shared/config');

const API_URL = '/ghost/api/canary/admin/';

const doAuth = (...args) => {
    return testUtils.API.doAuth(`${API_URL}session/`, ...args);
};

let request;

console.log(process.env.NODE_ENV);

describe('Test the site path', () => {
    beforeAll(async () => {
        await testUtils.startGhost();
        request = supertest.agent(config.get('url'));
        return await doAuth(request);
    }, 100000);


    afterAll(async() => {
        await testUtils.stopGhost();
    })

    test('It should response the GET method', async () => {
        const result = await request
            .get(`${API_URL}site/`)
            .expect(200);

        expect(result.body).toMatchSnapshot({
            site: {
                version: expect.stringMatching(/\d+\.\d+/)
            }

        });

        expect(result.headers).toMatchSnapshot({
            date: expect.any(String)
        });
    });
});
