import {IndexNowPingService} from './indexnow-ping-service';
import {lazySingleton} from '../../../shared/lazy-singleton';

let instance: IndexNowPingService | undefined;

export const service = lazySingleton('IndexNowPingService', () => instance);

export function init(): void {
    if (instance) {
        return;
    }

    const settingsCache = require('../../../shared/settings-cache');
    const config = require('../../../shared/config');
    const urlService = require('../url').service;
    const urlUtils = require('../../../shared/url-utils').default;
    const request = require('@tryghost/request');
    const logging = require('@tryghost/logging');
    const events = require('../../lib/common/events');

    instance = new IndexNowPingService({
        settingsCache,
        config,
        urlService,
        urlUtils,
        request,
        logging,
        events
    });

    instance.subscribeEvents();
}
