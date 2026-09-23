const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('TagsPublicService', () => instance);

async function init() {
    if (instance) {
        return;
    }

    const adapterManager = require('../adapter-manager').service;
    const config = require('../../../shared/config');
    const events = require('../../lib/common/events');

    let cache;
    if (config.get('hostSettings:tagsPublicCache:enabled')) {
        cache = adapterManager.getAdapter('cache:tagsPublic');
        events.on('site.changed', () => cache.reset());
    }

    instance = {cache};
}

module.exports = {init, service};
