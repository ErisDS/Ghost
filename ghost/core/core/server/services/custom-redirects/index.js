const {defineService} = require('../../../shared/service-lifecycle');

let instance;
let initPromise;

async function create() {
    if (!initPromise) {
        initPromise = (async () => {
            const config = require('../../../shared/config');
            const urlUtils = require('../../../shared/url-utils').default;
            const adapterManager = require('../adapter-manager').service;
            const DynamicRedirectManager = require('../lib/dynamic-redirect-manager');
            const {RedirectsService} = require('./redirects-service');
            const validation = require('./validation');

            const makeRedirectManager = () => new DynamicRedirectManager({
                permanentMaxAge: config.get('caching:customRedirects:maxAge'),
                getSubdirectoryURL: pathname => urlUtils.urlJoin(urlUtils.getSubdir(), pathname)
            });

            const redirectManager = makeRedirectManager();
            const redirectsService = new RedirectsService({
                store: adapterManager.getAdapter('redirects'),
                redirectManager,
                validate: validation.validate.bind(validation),
                createDryRunManager: makeRedirectManager
            });

            await redirectsService.init();

            instance = {
                api: redirectsService,
                middleware: redirectManager.handleRequest
            };
        })();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'CustomRedirectsService',
    create,
    reinitialize: true
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
