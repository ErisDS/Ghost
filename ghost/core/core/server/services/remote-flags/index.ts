import logging from '@tryghost/logging';
import {RemoteFlagsService} from './remote-flags-service';
import * as flagOverrides from '../../../shared/labs-flag-overrides';
import {defineService} from '../../../shared/service-lifecycle';

// @tryghost/request ships no types; require() avoids an implicit-any under the strict tsconfig.
const request = require('@tryghost/request');
const settingsCache = require('../../../shared/settings-cache');

interface ConfigLike {
    get(key: string): unknown;
}

interface RemoteFlagsConfig {
    enabled?: boolean;
    url?: string | null;
    pollInterval?: unknown;
}

interface RemoteFlagsRuntime {
    getInstance(): RemoteFlagsService | null;
}

const MIN_POLL_INTERVAL_MS = 60 * 1000;

function createRuntime(config: ConfigLike): RemoteFlagsRuntime {
    const remoteFlags = (config.get('remoteFlags') as RemoteFlagsConfig) || {};

    if (remoteFlags.enabled !== true || !remoteFlags.url) {
        return {getInstance: () => null};
    }

    const siteUuid = settingsCache.get('site_uuid') as string | undefined;

    let url: URL;
    try {
        url = new URL(remoteFlags.url);
    } catch {
        logging.warn({
            system: {event: 'remote_flags.invalid_url'}
        }, `Remote feature flags url is not a valid URL, not starting: ${remoteFlags.url}`);
        return {getInstance: () => null};
    }

    let pollInterval: number | undefined;
    const configuredInterval = remoteFlags.pollInterval;
    if (configuredInterval !== undefined && configuredInterval !== null) {
        if (typeof configuredInterval === 'number' && Number.isFinite(configuredInterval) && configuredInterval >= MIN_POLL_INTERVAL_MS) {
            pollInterval = configuredInterval;
        } else {
            logging.warn({
                system: {event: 'remote_flags.invalid_poll_interval'}
            }, `Remote feature flags pollInterval must be a number >= ${MIN_POLL_INTERVAL_MS}ms, using the default: ${configuredInterval}`);
        }
    }

    const instance = new RemoteFlagsService({
        url,
        siteUuid,
        applyOverrides: overrides => flagOverrides.replace(overrides),
        request,
        pollInterval
    });

    return {getInstance: () => instance};
}

const lifecycle = defineService<RemoteFlagsRuntime, [ConfigLike]>({
    name: 'RemoteFlagsService',
    create: createRuntime,
    async start(runtime) {
        await runtime.getInstance()?.start();
    },
    stop(runtime) {
        runtime.getInstance()?.stop();
    }
});

export const service = lifecycle.service;
export const shutdown = lifecycle.shutdown;

/**
 * A disabled or invalid configuration is a successfully initialized, inert
 * service rather than an uninitialized service. Boot awaits the first fetch
 * before publishing the facade, so consumers cannot observe a partially
 * started poller.
 */
export async function init(config: ConfigLike): Promise<RemoteFlagsService | null> {
    await lifecycle.init(config);
    return service.getInstance();
}
