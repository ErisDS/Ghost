const jestUtils = require('../../../jest-utils');

const API_URL = '/ghost/api/canary/admin';

let request;

describe('Authentication API', () => {
    beforeAll(async () => {
        request = await jestUtils.getRequestAgent();
    }, 10000);

    afterAll(async () => {
        jestUtils.shutdown();
    });

    beforeEach(function () {
        jestUtils.mockMail();
    });

    afterEach(function () {
        jestUtils.restoreAllMocks();
    });

    test('GET /authentication/setup', async () => {
        const result = await request
            .get(`${API_URL}/authentication/setup/`)
            .expect(200);

        expect(result.body).toMatchSnapshot();

        expect(result.headers).toMatchSnapshot({
            date: expect.toBeDateString(),
            etag: expect.any(String)
        });
    });

    // test('POST /authentication/setup', function () {
    //     return request
    //         .post(`${API_URL}/authentication/setup/`)
    //         // .set('Origin', config.get('url'))
    //         .send({
    //             setup: [{
    //                 name: 'test user',
    //                 email: 'test@example.com',
    //                 password: 'thisissupersafe',
    //                 blogTitle: 'a test blog'
    //             }]
    //         })
    //         .expect(201);

    //     expect(result.body).toMatchSnapshot();

    //     expect(result.headers).toMatchSnapshot({
    //         date: expect.toBeDateString()
    //     });

    //     // .then((res) => {
    //     //     const jsonResponse = res.body;
    //     //     should.exist(jsonResponse.users);
    //     //     should.not.exist(jsonResponse.meta);
    //     //     should.exist(res.headers['x-cache-invalidate']);

    //     //     jsonResponse.users.should.have.length(1);
    //     //     localUtils.API.checkResponse(jsonResponse.users[0], 'user');

    //     //     const newUser = jsonResponse.users[0];
    //     //     newUser.id.should.equal(testUtils.DataGenerator.Content.users[0].id);
    //     //     newUser.name.should.equal('test user');
    //     //     newUser.email.should.equal('test@example.com');

    //     //     mailService.GhostMailer.prototype.send.called.should.be.true();
    //     //     mailService.GhostMailer.prototype.send.args[0][0].to.should.equal('test@example.com');
    //     // });
    // });
});
