import {ExplorePingService} from './explore-ping-service';
import {defineService} from '../../../shared/service-lifecycle';

const lifecycle = defineService({
    name: 'ExplorePingService',
    create() {
        const config = require('../../../shared/config');
        const logging = require('@tryghost/logging');
        const ghostVersion = require('@tryghost/version');
        const request = require('@tryghost/request');
        const settingsCache = require('../../../shared/settings-cache');
        const posts = require('../posts').service;
        const members = require('../members');
        const statsService = require('../stats');

        return new ExplorePingService({
            settingsCache,
            config,
            logging,
            ghostVersion,
            request,
            posts,
            members,
            statsService
        });
    },
    start(instance) {
        const config = require('../../../shared/config');

        // This is background telemetry rather than a readiness dependency.
        if (config.isProductionOrDevelopment()) {
            instance.ping();
        }
    }
});

export const service = lifecycle.service;
export const init = lifecycle.init;
export const shutdown = lifecycle.shutdown;
