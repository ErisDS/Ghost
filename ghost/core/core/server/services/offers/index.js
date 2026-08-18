const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

const service = lazySingleton('OffersService', () => instance);

async function init() {
    if (instance) {
        return;
    }

    if (!initPromise) {
        initPromise = (async () => {
            const DynamicRedirectManager = require('../lib/dynamic-redirect-manager');
            const config = require('../../../shared/config');
            const urlUtils = require('../../../shared/url-utils').default;
            const models = require('../../models');
            const OfferBookshelfRepository = require('./offer-bookshelf-repository');
            const OffersModule = require('./offers-module');

            const redirectManager = new DynamicRedirectManager({
                permanentMaxAge: config.get('caching:customRedirects:maxAge'),
                getSubdirectoryURL: pathname => urlUtils.urlJoin(urlUtils.getSubdir(), pathname)
            });
            const repository = new OfferBookshelfRepository(models.Offer, models.OfferRedemption);
            const offersModule = OffersModule.create({redirectManager, repository});

            await offersModule.init();

            instance = {
                api: offersModule.api,
                middleware: redirectManager.handleRequest
            };
        })();
    }

    try {
        await initPromise;
    } catch (error) {
        initPromise = undefined;
        throw error;
    }
}

module.exports = {init, service};
