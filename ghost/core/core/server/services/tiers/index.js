const {lazySingleton} = require('../../../shared/lazy-singleton');

const instance = {};
let initPromise;

const service = lazySingleton('TiersService', () => instance);

async function init() {
    if (!initPromise) {
        initPromise = (async () => {
            const TiersAPI = require('./tiers-api');
            const DomainEvents = require('@tryghost/domain-events');
            const models = require('../../models');
            const TierRepository = require('./tier-repository');

            const repository = new TierRepository({
                ProductModel: models.Product,
                DomainEvents
            });

            const slugService = {
                async generate(input) {
                    return models.Product.generateSlug(models.Product, input, {});
                }
            };

            await repository.init();

            instance.repository = repository;
            instance.api = new TiersAPI({repository, slugService});
        })();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }
}

module.exports = {init, service};
