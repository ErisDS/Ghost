const jestUtils = require('../../../jest-utils');

let agent;

describe('Authentication API', () => {
    let mailSpy;

    beforeAll(async () => {
        agent = await jestUtils.getAgent('/ghost/api/canary/admin');
    });

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
        await agent
            .get('/authentication/setup/')
            .expect((response) => {
                expect(response.body).toMatchSnapshot();

                expect(response.headers).toMatchHeaderSnapshot();
            })
            .expect(200);
    });

    test('POST /authentication/setup: Complete setup', async () => {
        await agent
            .post('/authentication/setup/')
            .send({
                setup: [{
                    name: 'test user',
                    email: 'test@example.com',
                    password: 'thisissupersafe',
                    blogTitle: 'a test blog'
                }]
            })
            .expect((response) => {
                expect(response.body).toMatchSnapshot({
                    users: [{
                        created_at: expect.toBeDateString(),
                        updated_at: expect.toBeDateString()
                    }]
                });

                expect(response.headers).toMatchHeaderSnapshot();

                expect(mailSpy).toHaveBeenCalled();
                expect(mailSpy).toHaveBeenCalledWith(expect.objectContaining({to: 'test@example.com'}));
            })
            .expect(201);
    });

    it('GET /authentication/setup: Check site is setup now!', async () => {
        const response = await agent
            .get('/authentication/setup/')
            .expect(200);

        expect(response.body).toMatchSnapshot();

        expect(response.headers).toMatchHeaderSnapshot();
    });

    test('POST /authentication/setup: Cannot complete setup a second time', async () => {
        await agent
            .post('/authentication/setup/')
            .send({
                setup: [{
                    name: 'test user',
                    email: 'test-leo@example.com',
                    password: 'thisissupersafe',
                    blogTitle: 'a test blog'
                }]
            })
            .expect((response) => {
                expect(response.body).toMatchSnapshot({
                    errors: [{
                        id: expect.any(String)
                    }]
                });

                expect(response.headers).toMatchHeaderSnapshot();

                expect(mailSpy).not.toHaveBeenCalled();
            })
            .expect(403);
    });

    test('PUT /authentication/setup/', async () => {
        // Login as the user we just created
        await agent.loginAs('test@example.com', 'thisissupersafe');

        await agent
            .put('/authentication/setup/')
            .send({
                setup: [{
                    name: 'test user edit',
                    email: 'test-edit@example.com',
                    password: 'thisissupersafe',
                    blogTitle: 'an updated test blog'
                }]
            })
            .expect((response) => {
                expect(response.body).toMatchSnapshot({
                    users: [{
                        created_at: expect.toBeDateString(),
                        updated_at: expect.toBeDateString()
                    }]
                });

                expect(response.headers).toMatchHeaderSnapshot();
            })
            .expect(200);
    });
});
