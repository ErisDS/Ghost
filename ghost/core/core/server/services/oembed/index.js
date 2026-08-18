const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('OEmbedService', () => instance);

function init() {
    if (instance) {
        return;
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
}

module.exports = {init, service};
