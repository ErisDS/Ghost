const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

const service = lazySingleton('CustomRedirectsService', () => instance);

async function init() {
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
}

module.exports = {init, service};
