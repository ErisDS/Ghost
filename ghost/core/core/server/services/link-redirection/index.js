const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const urlUtils = require('../../../shared/url-utils').default;
    const LinkRedirectRepository = require('./link-redirect-repository');
    const adapterManager = require('../adapter-manager').service;
    const config = require('../../../shared/config');
    const events = require('../../lib/common/events');
    const models = require('../../models');
    const LinkRedirectsService = require('./link-redirects-service');

    const repository = new LinkRedirectRepository({
        LinkRedirect: models.Redirect,
        urlUtils,
        cacheAdapter: config.get('hostSettings:linkRedirectsPublicCache:enabled')
            ? adapterManager.getAdapter('cache:linkRedirectsPublic')
            : null,
        EventRegistry: events
    });

    const linkRedirectsService = new LinkRedirectsService({
        linkRedirectRepository: repository,
        config: {baseURL: new URL(urlUtils.getSiteUrl())}
    });

    instance = {
        service: linkRedirectsService,
        linkRedirectRepository: repository
    };

    return instance;
}
const lifecycle = defineService({
    name: 'LinkRedirectsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
