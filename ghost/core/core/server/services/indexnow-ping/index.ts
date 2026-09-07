import {IndexNowPingService} from './indexnow-ping-service';
import {defineService} from '../../../shared/service-lifecycle';

const lifecycle = defineService({
    name: 'IndexNowPingService',
    create() {
        const settingsCache = require('../../../shared/settings-cache');
        const config = require('../../../shared/config');
        const urlService = require('../url');
        const urlUtils = require('../../../shared/url-utils').default;
        const request = require('@tryghost/request');
        const logging = require('@tryghost/logging');
        const events = require('../../lib/common/events');

        return new IndexNowPingService({
            settingsCache,
            config,
            urlService,
            urlUtils,
            request,
            logging,
            events
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
