const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('PostsPublicService', () => instance);

async function init() {
    if (instance) {
        return;
    }

    const adapterManager = require('../adapter-manager').service;
    const config = require('../../../shared/config');
    const events = require('../../lib/common/events');

    let cache;
    if (config.get('hostSettings:postsPublicCache:enabled')) {
        cache = adapterManager.getAdapter('cache:postsPublic');
        events.on('site.changed', () => cache.reset());
    }

    instance = {cache};
}

module.exports = {init, service};
