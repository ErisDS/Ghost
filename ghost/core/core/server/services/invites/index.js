const Invites = require('./invites');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

function init() {
    if (!instance) {
        const settingsCache = require('../../../shared/settings-cache');
        const settingsHelpers = require('../settings-helpers').service;
        const mailService = require('../mail');
        const urlUtils = require('../../../shared/url-utils').default;

        instance = new Invites({settingsCache, settingsHelpers, mailService, urlUtils});
    }
}

const service = lazySingleton('InvitesService', () => instance);

module.exports = {init, service};
