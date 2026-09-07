const {IdentityTokenService} = require('./identity-token-service');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;
let initPromise;

async function create() {
    if (instance) {
        return instance;
    }

    if (!initPromise) {
        initPromise = (async () => {
            const urlUtils = require('../../../shared/url-utils').default;
            const settings = require('../../../shared/settings-cache');
            const jose = require('node-jose');

            const privateKey = settings.get('ghost_private_key');
            const issuer = urlUtils.urlFor('admin', true);
            const keyStore = jose.JWK.createKeyStore();
            const key = await keyStore.add(privateKey, 'pem');

            instance = new IdentityTokenService(privateKey, issuer, key.kid);
        })();
    }

    try {
        await initPromise;
    } catch (error) {
        initPromise = undefined;
        throw error;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'IdentityTokenService',
    create
});


module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
