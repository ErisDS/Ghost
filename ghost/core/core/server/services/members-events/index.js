const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const labsService = require('../../../shared/labs');
    const DomainEvents = require('@tryghost/domain-events');
    const events = require('../../lib/common/events');
    const settingsCache = require('../../../shared/settings-cache');
    const members = require('../members').service;
    const config = require('../../../shared/config');
    const EventStorage = require('./event-storage');
    const LastSeenAtUpdater = require('./last-seen-at-updater');
    const LastSeenAtCache = require('./last-seen-at-cache');
    const models = require('../../models');
    const db = require('../../data/db');

    const eventStorage = new EventStorage({
        models: {
            MemberCreatedEvent: models.MemberCreatedEvent,
            SubscriptionCreatedEvent: models.SubscriptionCreatedEvent
        },
        labsService
    });

    const lastSeenAtCache = new LastSeenAtCache({services: {settingsCache}});
    const lastSeenAtUpdater = new LastSeenAtUpdater({
        services: {settingsCache},
        getMembersApi: () => members.api,
        db,
        events,
        lastSeenAtCache,
        config
    });

    eventStorage.subscribe(DomainEvents);
    lastSeenAtUpdater.subscribe(DomainEvents);

    instance = {
        eventStorage,
        lastSeenAtUpdater,
        clearLastSeenAtCache() {
            lastSeenAtCache.clear();
        }
    };

    return instance;
}
const lifecycle = defineService({
    name: 'MembersEventsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
