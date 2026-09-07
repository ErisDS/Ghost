const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const config = require('../../../shared/config');
    const adapterManager = require('../adapter-manager').service;
    const externalRequest = require('../../lib/request-external');
    const OEmbedService = require('./oembed-service');
    const NFT = require('./nft-oembed-provider');
    const Twitter = require('./twitter-oembed-provider');

    instance = new OEmbedService({
        config,
        externalRequest,
        imageStore: adapterManager.getAdapter('storage:images')
    });

    instance.registerProvider(new NFT({
        config: {apiKey: config.get('opensea').privateReadOnlyApiKey}
    }));
    instance.registerProvider(new Twitter({
        config: {bearerToken: config.get('twitter').privateReadOnlyToken}
    }));

    return instance;
}
const lifecycle = defineService({
    name: 'OEmbedService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
