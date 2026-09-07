const {defineService} = require('../../../shared/service-lifecycle');

const instance = {};
let initPromise;

async function create() {
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

    return instance;
}
const lifecycle = defineService({
    name: 'TiersService',
    create,
    stableInstance: instance,
    reinitialize: true
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
