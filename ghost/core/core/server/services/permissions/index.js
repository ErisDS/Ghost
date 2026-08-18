const models = require('../../models');
const actionsMap = require('./actions-map-cache');
const canThis = require('./can-this');
const parseContext = require('./parse-context');
const {lazySingleton} = require('../../../shared/lazy-singleton');

const instance = {canThis, parseContext};
let initPromise;

async function init(options = {}) {
    if (!initPromise) {
        initPromise = models.Permission.findAll(options).then((permissionsCollection) => {
            return actionsMap.init(permissionsCollection);
        });
    }

    try {
        return await initPromise;
    } finally {
        initPromise = undefined;
    }
}

const service = lazySingleton('PermissionsService', () => instance);

module.exports = {init, service};
