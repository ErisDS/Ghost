import {SlackPingService} from './slack-ping-service';
import {defineService} from '../../../shared/service-lifecycle';

const lifecycle = defineService({
    name: 'SlackPingService',
    create() {
        const {blogIcon} = require('../../lib/image');
        const events = require('../../lib/common/events');
        const logging = require('@tryghost/logging');
        const request = require('../../lib/request-external');
        const settingsCache = require('../../../shared/settings-cache');
        const urlService = require('../url').service;
        const urlUtils = require('../../../shared/url-utils').default;

        return new SlackPingService({
            blogIcon,
            events,
            logging,
            request,
            settingsCache,
            urlService,
            urlUtils
        });
    },
    start(instance) {
        instance.subscribeEvents();
    },
    stop(instance) {
        instance.unsubscribeEvents();
    }
});

export const service = lifecycle.service;
export const init = lifecycle.init;
export const shutdown = lifecycle.shutdown;
