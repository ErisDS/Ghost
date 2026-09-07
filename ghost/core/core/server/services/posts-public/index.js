const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
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

    return instance;
}
const lifecycle = defineService({
    name: 'PostsPublicService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
