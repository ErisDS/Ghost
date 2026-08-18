const LazyUrlService = require('./lazy-url-service');
const {createFindResource} = require('./lazy-find-resource');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('UrlService', () => instance);

function init() {
    if (instance) {
        return;
    }

    const models = require('../../models');

    // Every caller shares the router registrations made by RouterManager at
    // boot and on every routes.yaml reload.
    instance = new LazyUrlService({findResource: createFindResource(models)});
}

module.exports = {
    init,
    service
};
