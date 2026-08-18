const {IdentityTokenService} = require('./identity-token-service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

const service = lazySingleton('IdentityTokenService', () => instance);

async function init() {
    if (instance) {
        return;
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
}

module.exports = {
    init,
    service
};
