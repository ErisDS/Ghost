const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const DomainEvents = require('@tryghost/domain-events');
    const config = require('../../../shared/config');
    const logging = require('@tryghost/logging');
    const urlUtils = require('../../../shared/url-utils').default;
    const SlackNotificationsService = require('./slack-notifications-service');
    const SlackNotifications = require('./slack-notifications');

    const hostSettings = config.get('hostSettings');
    const siteUrl = urlUtils.getSiteUrl();
    const isEnabled = !!(hostSettings?.milestones?.enabled && hostSettings?.milestones?.url);
    const webhookUrl = hostSettings?.milestones?.url;
    const minThreshold = hostSettings?.milestones?.minThreshold ? parseInt(hostSettings.milestones.minThreshold) : 0;

    const slackNotifications = new SlackNotifications({webhookUrl, siteUrl, logging});

    instance = new SlackNotificationsService({
        DomainEvents,
        logging,
        config: {isEnabled, webhookUrl, minThreshold},
        slackNotifications
    });

    instance.subscribeEvents();

    return instance;
}
const lifecycle = defineService({
    name: 'SlackNotificationsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
