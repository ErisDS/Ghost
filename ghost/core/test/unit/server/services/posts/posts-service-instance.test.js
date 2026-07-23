const assert = require('node:assert/strict');

describe('Posts service composition root', function () {
    let posts;

    beforeEach(function () {
        const modulePath = require.resolve('../../../../../core/server/services/posts/posts-service-instance');
        delete require.cache[modulePath];
        posts = require(modulePath);
    });

    it('fails loudly when the service is used before initialization', function () {
        assert.throws(
            () => posts.service.browsePosts({}),
            /PostsService must be initialized before use/
        );
    });

    it('returns the same instance from repeated initialization', function () {
        const instance = posts.init();

        assert.equal(posts.init(), instance);
        assert.equal(Object.getPrototypeOf(posts.service), Object.getPrototypeOf(instance));
    });
});
