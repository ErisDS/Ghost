import {SlackPingService} from './slack-ping-service';

let service: SlackPingService | undefined;

export function init(): void {
    if (service) {
        return;
    }

    const {blogIcon} = require('../../lib/image');
    const events = require('../../lib/common/events');
    const logging = require('@tryghost/logging');
    const request = require('../../lib/request-external');
    const settingsCache = require('../../../shared/settings-cache');
    const urlService = require('../url');
    const urlUtils = require('../../../shared/url-utils').default;

    service = new SlackPingService({
        blogIcon,
        events,
        logging,
        request,
        settingsCache,
        urlService,
        urlUtils
    });

    service.subscribeEvents();
}
