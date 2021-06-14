const adapterManager = require('../../services/adapter-manager');

function getCache() {
    return adapterManager.getAdapter('cache');
}

module.exports.getCache = getCache;
