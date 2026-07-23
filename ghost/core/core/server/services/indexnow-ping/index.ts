import {IndexNowPingService} from './indexnow-ping-service';

let service: IndexNowPingService | undefined;

export function init(): void {
    if (service) {
        return;
    }

    const settingsCache = require('../../../shared/settings-cache');
    const config = require('../../../shared/config');
    const urlService = require('../url');
    const urlUtils = require('../../../shared/url-utils').default;
    const request = require('@tryghost/request');
    const logging = require('@tryghost/logging');
    const events = require('../../lib/common/events');

    service = new IndexNowPingService({
        settingsCache,
        config,
        urlService,
        urlUtils,
        request,
        logging,
        events
    });

    service.subscribeEvents();
}
