const DomainEvents = require('@tryghost/domain-events');
const labs = require('../../../shared/labs');
const {lazySingleton} = require('../../../shared/lazy-singleton');

class StaffServiceWrapper {
    init() {
        if (this.api) {
            // Prevent creating duplicate DomainEvents subscribers
            return;
        }

        const StaffService = require('./staff-service');

        const logging = require('@tryghost/logging');
        const models = require('../../models');
        const memberAttribution = require('../member-attribution');
        const {GhostMailer} = require('../mail');
        const mailer = new GhostMailer();
        const settingsCache = require('../../../shared/settings-cache');
        const urlUtils = require('../../../shared/url-utils').default;
        const {blogIcon} = require('../../../server/lib/image');
        const settingsHelpers = require('../settings-helpers').service;

        this.api = new StaffService({
            logging,
            models,
            mailer,
            settingsHelpers,
            settingsCache,
            urlUtils,
            blogIcon,
            DomainEvents,
            memberAttributionService: memberAttribution.service.service,
            labs
        });

        this.api.subscribeEvents();
    }
}

let instance;

function init() {
    if (!instance) {
        const staffService = new StaffServiceWrapper();
        staffService.init();
        instance = staffService;
    }
}

const service = lazySingleton('StaffService', () => instance);

module.exports = {init, service};
