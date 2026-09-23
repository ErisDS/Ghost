import errors from '@tryghost/errors';
import { JobsService } from './jobs-service';
import type { JobsShutdownOptions } from '@tryghost/adapter-base-jobs';
import { lazySingleton } from '../../../shared/lazy-singleton';

let instance: JobsService | undefined;
export const service = lazySingleton<JobsService>('JobsService', () => instance);

export function init(): JobsService {
  // The instance lives for the whole process: the didInit-guarded mentions
  // service captures it in MentionController and MentionSendingService, so
  // an in-process restart (test harness) must revive the same object rather
  // than strand those references on a stopped queue.
  if (instance) {
    instance.clearHandlers();
    return instance;
  }

  const adapterManager = require('../adapter-manager').service;
  const logging = require('@tryghost/logging');
  const sentry = require('../../../shared/sentry');

  instance = new JobsService({
    backend: adapterManager.getAdapter('jobs'),
    logging,
    sentry,
  });

  return instance;
}

export function getInstance(): JobsService {
  if (!instance) {
    throw new errors.IncorrectUsageError({
      message: 'Jobs service used before init(). Call init() from boot first.',
    });
  }
  return instance;
}

export function shutdown(options?: JobsShutdownOptions): Promise<void> {
  if (!instance) {
    return Promise.resolve();
  }
  return instance.shutdown(options);
}
