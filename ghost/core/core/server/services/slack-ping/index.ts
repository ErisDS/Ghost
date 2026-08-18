import {SlackPingService} from './slack-ping-service';
import {lazySingleton} from '../../../shared/lazy-singleton';

let instance: SlackPingService | undefined;

export const service = lazySingleton('SlackPingService', () => instance);

export function init(): void {
    if (instance) {
        return;
    }

    const {blogIcon} = require('../../lib/image');
    const events = require('../../lib/common/events');
    const logging = require('@tryghost/logging');
    const request = require('../../lib/request-external');
    const settingsCache = require('../../../shared/settings-cache');
    const urlService = require('../url').service;
    const urlUtils = require('../../../shared/url-utils').default;

    instance = new SlackPingService({
        blogIcon,
        events,
        logging,
        request,
        settingsCache,
        urlService,
        urlUtils
    });

    instance.subscribeEvents();
}
