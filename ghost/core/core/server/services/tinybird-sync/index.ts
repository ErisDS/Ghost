import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import ObjectId from 'bson-objectid';
import logging from '@tryghost/logging';
import config from '../../../shared/config';
// @ts-expect-error This module lacks type definitions.
import labs from '../../../shared/labs';
// @ts-expect-error This module lacks type definitions.
import settingsCache from '../../../shared/settings-cache';
import { knex } from '../../data/db';
import { createTinybirdSyncService } from './tinybird-sync-service';
import { lazySingleton } from '../../../shared/lazy-singleton';

let instance: ReturnType<typeof createTinybirdSyncService> | undefined;
export const service = lazySingleton('TinybirdSyncService', () => instance);

export function init(): void {
  instance ??= createTinybirdSyncService({
    config,
    settingsCache,
    labs,
    knex,
    logging,
    sleep: async (ms) => {
      await setTimeoutPromise(ms, undefined, { ref: false });
    },
    random: Math.random,
    now: () => new Date(),
    fetch: globalThis.fetch,
    createId: () => ObjectId().toHexString(),
  });
}
