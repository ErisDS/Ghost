const models = require('../../models');
const actionsMap = require('./actions-map-cache');
const canThis = require('./can-this');
const parseContext = require('./parse-context');
const {defineService} = require('../../../shared/service-lifecycle');

const instance = {canThis, parseContext};
let initPromise;
let actions;

async function create(options = {}) {
    if (!initPromise) {
        initPromise = models.Permission.findAll(options).then((permissionsCollection) => {
            return actionsMap.init(permissionsCollection);
        });
    }

    try {
        actions = await initPromise;
        return instance;
    } finally {
        initPromise = undefined;
    }
}
const lifecycle = defineService({
    name: 'PermissionsService',
    create,
    stableInstance: instance,
    reinitialize: true
});

async function init(options) {
    await lifecycle.init(options);
    return actions;
}

module.exports = {init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
