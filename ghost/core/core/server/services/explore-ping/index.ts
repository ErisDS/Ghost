import {ExplorePingService} from './explore-ping-service';
import {lazySingleton} from '../../../shared/lazy-singleton';

let instance: ExplorePingService | undefined;

export const service = lazySingleton('ExplorePingService', () => instance);

export async function init(): Promise<void> {
    if (instance) {
        return;
    }

    const config = require('../../../shared/config');

    const logging = require('@tryghost/logging');
    const ghostVersion = require('@tryghost/version');
    const request = require('@tryghost/request');
    const settingsCache = require('../../../shared/settings-cache');
    const posts = require('../posts').service;
    const members = require('../members').service;
    const statsService = require('../stats').service;

    instance = new ExplorePingService({
        settingsCache,
        config,
        logging,
        ghostVersion,
        request,
        posts,
        members,
        statsService
    });

    // The explore ping is a background "phone home" request. Construct the
    // service in every environment so init() always fulfils the service
    // contract, but only trigger the request in production or development.
    if (config.isProductionOrDevelopment()) {
        // The final intention is to have this run on a schedule. For the
        // initial version, ping when the server starts without awaiting it.
        instance.ping();
    }
}
