const jestUtils = require('../../../jest-utils');

const API_URL = '/ghost/api/canary/admin';

let request;

describe('Authentication API', () => {
    let mailSpy;

    beforeAll(async () => {
        request = await jestUtils.getRequestAgent();
    }, 10000);

    // This is needed for any tests which are writing to the DB
    afterAll(async () => {
        await jestUtils.resetDb();
    });

    beforeEach(function () {
        mailSpy = jestUtils.mocks.mail();
    });

    afterEach(function () {
        jestUtils.mocks.restoreAll();
    });

    test('GET /authentication/setup: Check site is not setup.', async () => {
        const result = await request
            .get(`${API_URL}/authentication/setup/`)
            .expect(200);

        expect(result.body).toMatchSnapshot();

        expect(result.headers).toMatchSnapshot({
            date: expect.toBeDateString(),
            etag: expect.any(String)
        });
    });

    test('POST /authentication/setup: Complete setup', async () => {
        const result = await request
            .post(`${API_URL}/authentication/setup/`)
            // .set('Origin', config.get('url'))
            .send({
                setup: [{
                    name: 'test user',
                    email: 'test@example.com',
                    password: 'thisissupersafe',
                    blogTitle: 'a test blog'
                }]
            })
            .expect(201);

        expect(result.body).toMatchSnapshot({
            users: [{
                created_at: expect.toBeDateString(),
                updated_at: expect.toBeDateString()
            }]
        });

        expect(result.headers).toMatchSnapshot({
            date: expect.toBeDateString(),
            etag: expect.any(String)
        });

        expect(mailSpy).toHaveBeenCalled();
        expect(mailSpy).toHaveBeenCalledWith(expect.objectContaining({to: 'test@example.com'}));
    });
});
