const assert = require('node:assert/strict');

describe('Posts service composition root', function () {
    let posts;

    beforeEach(function () {
        const modulePath = require.resolve('../../../../../core/server/services/posts');
        delete require.cache[modulePath];
        posts = require(modulePath);
    });

    it('fails loudly when the service is used before initialization', function () {
        assert.throws(
            () => posts.service.browsePosts({}),
            /PostsService must be initialized before use/
        );
    });

    it('initializes idempotently', function () {
        posts.init();
        const prototype = Object.getPrototypeOf(posts.service);

        assert.equal(posts.init(), undefined);
        assert.equal(Object.getPrototypeOf(posts.service), prototype);
    });
});
