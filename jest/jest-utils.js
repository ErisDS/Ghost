const debug = require('@tryghost/debug')('test:jest');

const supertest = require('supertest');
const errors = require('@tryghost/errors');
const {sequence} = require('@tryghost/promise');
const _ = require('lodash');

const boot = require('../core/boot');
const urlServiceUtils = require('../test/utils/url-service-utils');
const fixtures = require('../test/utils/fixture-utils');

const db = require('./utils/db.js');
const oldDbUtils = require('../test/utils/db-utils');
const KnexMigrator = require('knex-migrator');
const knexMigrator = new KnexMigrator();

// function prefixUrl(prefix) {
//     return function (request) {
//         console.log('doing prefix', request);
//         return request;
//     };
// }

class TestAgent {
    constructor(API_URL, app) {
        this.API_URL = API_URL;

        this.app = app;

        this.request = supertest
            .agent(app);
    }

    /**
     * Helper method to concatenate urls
     * @NOTE: this is essentially a duplicate of our internal urljoin tool that is stuck in the too-big url-utils package atm
     * @param {string} url
     * @returns
     */
    makeUrl(url) {
        // Join the base URL and the main url and remove any duplicate slashes
        return `${this.API_URL}/${url}`.replace(/(^|[^:])\/\/+/g, '$1/');
    }

    // Forward get(), post(), put(), and delete() straight to the request agent & handle the URL
    get(url) {
        return this.request.get(this.makeUrl(url));
    }

    post(url) {
        return this.request.post(this.makeUrl(url));
    }

    put(url) {
        return this.request.put(this.makeUrl(url));
    }

    delete(url) {
        return this.request.delete(this.makeUrl(url));
    }

    async initFixtures(...options) {
        // No DB setup, but override the owner
        options = _.merge({'owner:post': true}, _.transform(options, function (result, val) {
            if (val) {
                result[val] = true;
            }
        }));

        const fixtureOps = fixtures.getFixtureOps(options);

        return sequence(fixtureOps);
    }

    getFixture(type, index = 0) {
        return fixtures.DataGenerator.forKnex[type][index];
    }

    async loginAs(email, password) {
        await this.post('/session/')
            .send({
                grant_type: 'password',
                username: email,
                password: password
            })
            .then(function then(res) {
                if (res.statusCode === 302) {
                    // This can happen if you already have an instance running e.g. if you've been using Ghost CLI recently
                    throw new errors.GhostError({
                        message: 'Ghost is redirecting, do you have an instance already running on port 2369?'
                    });
                } else if (res.statusCode !== 200 && res.statusCode !== 201) {
                    throw new errors.GhostError(res.body.errors[0]);
                }

                return res.headers['set-cookie'];
            });
    }

    async loginAsOwner() {
        // temporary copy-pasta
        let user = {
            // owner (owner is still id 1 because of permissions)
            id: '1',
            name: 'Joe Bloggs',
            slug: 'joe-bloggs',
            email: 'jbloggs@example.com',
            password: 'Sl1m3rson99',
            profile_image: 'https://example.com/super_photo.jpg'
        };

        await this.loginAs(user.email, user.password);
    }
}

module.exports.getAgent = async (API_URL) => {
    const rootApp = await boot({serverStart: false});

    await urlServiceUtils.isFinished();

    const agent = new TestAgent(API_URL, rootApp);

    return agent;
};

module.exports.resetDb = async () => {
    await oldDbUtils.teardown();
    debug('teardown done');
    // The tables have been truncated, this runs the fixture init task (init file 2) to re-add our default fixtures
    await knexMigrator.init({only: 2});

    debug('init done');
    urlServiceUtils.reset();
    urlServiceUtils.init();
    await urlServiceUtils.isFinished();
    debug('urlservice done');
};

module.exports.mocks = require('./utils/mocks');
