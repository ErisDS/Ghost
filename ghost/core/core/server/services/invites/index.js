const Invites = require('./invites');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (!instance) {
        const settingsCache = require('../../../shared/settings-cache');
        const settingsHelpers = require('../settings-helpers').service;
        const mailService = require('../mail');
        const urlUtils = require('../../../shared/url-utils').default;

        instance = new Invites({settingsCache, settingsHelpers, mailService, urlUtils});
    }

    return instance;
}
const lifecycle = defineService({
    name: 'InvitesService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
