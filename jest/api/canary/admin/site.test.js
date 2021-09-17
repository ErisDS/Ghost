const jestUtils = require('../../../jest-utils');

const API_URL = '/ghost/api/canary/admin/';

let request;

describe('Test the site path', () => {
    beforeAll(async () => {
        request = await jestUtils.getRequestAgent();
    }, 10000);

    afterAll(async () => {
        jestUtils.shutdown();
    });

    test('It should respond to the GET method', async () => {
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

    test('It should respond to the GET method with a query param', async () => {
        const result = await request
            .get(`${API_URL}site/?foo=bar`)
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
