const LazyUrlService = require('./lazy-url-service');
const {createFindResource} = require('./lazy-find-resource');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const models = require('../../models');

    // Every caller shares the router registrations made by RouterManager at
    // boot and on every routes.yaml reload.
    instance = new LazyUrlService({findResource: createFindResource(models)});

    return instance;
}
const lifecycle = defineService({
    name: 'UrlService',
    create
});


module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
