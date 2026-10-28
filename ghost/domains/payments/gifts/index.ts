import { defineService } from '../../../core/kernel/define-service';
import { SignedFlushScheduler } from '../../../core/server/adapters/scheduling/signed-flush-scheduler';
import { GiftBookshelfRepository } from './gift-bookshelf-repository';
import { GiftDeliveryBookshelfRepository } from './gift-delivery-bookshelf-repository';
import { GiftDeliveryService } from './gift-delivery-service';
import { GiftService } from './gift-service';
import { GiftEmailService } from './gift-email-service';
import { GiftController } from './gift-controller';
import { SendGiftDeliveryEvent } from './events/send-gift-delivery-event';
import { StartGiftDeliveryFlushEvent } from './events/start-gift-delivery-flush-event';

const GiftCheckoutAdapter = require('./gift-checkout-adapter');
const StartGiftReminderFlushEvent = require('./events/start-gift-reminder-flush-event');

type Deps<Class> = Class extends new (deps: infer D) => unknown ? D : never;
type GiftServiceDeps = Deps<typeof GiftService>;
type GiftDeliveryServiceDeps = Deps<typeof GiftDeliveryService>;
type GiftEmailServiceDeps = Deps<typeof GiftEmailService>;
type GiftRepositoryDeps = Deps<typeof GiftBookshelfRepository>;
type GiftDeliveryRepositoryDeps = Deps<typeof GiftDeliveryBookshelfRepository>;
type SchedulerDeps = Deps<typeof SignedFlushScheduler>;

interface EventBus {
  subscribe<Event>(
    EventClass: new (...args: never[]) => Event,
    handler: (event: Event) => void | Promise<void>,
  ): void;
  dispatch(event: unknown): void;
}

interface Logger {
  info(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

/**
 * Everything the gifts capability used to require() for itself. The domain's
 * wiring root supplies it at register(); nothing in this folder imports
 * application code.
 */
export interface GiftsDependencies {
  models: {
    knex: GiftRepositoryDeps['knex'];
    GiftModel: GiftRepositoryDeps['GiftModel'];
    GiftDeliveryModel: GiftDeliveryRepositoryDeps['GiftDeliveryModel'];
    StripeCustomerModel: unknown;
  };
  getStripeApi: () => unknown;
  getMemberRepository: () => GiftServiceDeps['memberRepository'];
  getStaffServiceEmails: () => GiftServiceDeps['staffServiceEmails'];
  tiersService: GiftServiceDeps['tiersService'];
  settingsCache: GiftServiceDeps['settingsCache'];
  email: GiftEmailServiceDeps;
  emailAnalytics: GiftDeliveryServiceDeps['giftEmailAnalytics'];
  scheduling: {
    apiUrl: string;
    adapter: SchedulerDeps['adapter'] & { rescheduleOnBoot?: boolean };
    internalKeys: SchedulerDeps['internalKeys'];
  };
  domainEvents: EventBus;
  SubscriptionActivatedEvent: new (...args: never[]) => { data: { memberId: string } };
  logging: Logger;
}

export interface GiftsRuntime {
  readonly giftService: GiftService;
  readonly giftDeliveryService: GiftDeliveryService;
  readonly controller: GiftController;
  /** Dispatch on the injected event bus; lets the domain surface build controllers before register(). */
  dispatchEvent(event: unknown): void;
  /** Bind the domain-event listeners. Called once, at register(). */
  subscribeEvents(): void;
  /** Re-arm future deliveries and retry sends interrupted by a previous shutdown. */
  recoverPendingDeliveries(): Promise<void>;
}

export const gifts = defineService('Gifts', (deps: GiftsDependencies): GiftsRuntime => {
  const { models, scheduling, domainEvents, logging } = deps;

  const repository = new GiftBookshelfRepository({ GiftModel: models.GiftModel, knex: models.knex });
  const deliveryRepository = new GiftDeliveryBookshelfRepository({
    GiftDeliveryModel: models.GiftDeliveryModel,
    knex: models.knex,
  });
  const checkoutAdapter = new GiftCheckoutAdapter({
    StripeCustomerModel: models.StripeCustomerModel,
    getStripeApi: deps.getStripeApi,
  });
  const giftEmailService = new GiftEmailService(deps.email);

  const giftDeliveryScheduler = new SignedFlushScheduler({
    apiUrl: scheduling.apiUrl,
    adapter: scheduling.adapter,
    internalKeys: scheduling.internalKeys,
    endpoint: ['gifts', 'flush_deliveries'],
    name: 'gift_delivery',
    findScheduledTimes: async () => {
      const scheduled = await deliveryRepository.findScheduledTimesForPurchasedGifts(new Date());
      return scheduled.map((scheduledAt) => scheduledAt.getTime());
    },
  });
  const giftDeliveryService = new GiftDeliveryService({
    giftRepository: repository,
    giftDeliveryRepository: deliveryRepository,
    tiersService: deps.tiersService,
    giftEmailService,
    giftEmailAnalytics: deps.emailAnalytics,
    giftDeliveryScheduler,
  });

  const giftReminderScheduler = new SignedFlushScheduler({
    apiUrl: scheduling.apiUrl,
    adapter: scheduling.adapter,
    internalKeys: scheduling.internalKeys,
    endpoint: ['gifts', 'flush_reminders'],
    name: 'gift_reminder',
    legacyDelaysMs: [0],
    findScheduledTimes: async () => {
      const pending = await repository.findUnsentReminders();
      return pending
        .map((gift) => gift.reminderDueAt()?.getTime())
        .filter((time): time is number => time !== undefined);
    },
  });
  const giftService = new GiftService({
    giftRepository: repository,
    giftDeliveryService,
    get memberRepository() {
      return deps.getMemberRepository();
    },
    tiersService: deps.tiersService,
    giftEmailService,
    get staffServiceEmails() {
      return deps.getStaffServiceEmails();
    },
    giftReminderScheduler,
    checkoutAdapter,
    settingsCache: deps.settingsCache,
  });
  const controller = new GiftController({ service: giftService });

  // Persistent scheduling adapters keep their queue across restarts and opt out
  // of boot-time rebuilds (same contract post scheduling honours in boot).
  const rescheduleDeliveriesOnBoot = Boolean(scheduling.adapter.rescheduleOnBoot);

  return {
    giftService,
    giftDeliveryService,
    controller,
    dispatchEvent(event) {
      domainEvents.dispatch(event);
    },

    subscribeEvents() {
      domainEvents.subscribe(deps.SubscriptionActivatedEvent, async (event) => {
        try {
          await giftService.handlePaidSubscriptionActivation(event.data.memberId);
        } catch (err) {
          logging.error(err, 'Failed to consume gift on paid subscription activation');
        }
      });

      domainEvents.subscribe(StartGiftReminderFlushEvent, async () => {
        const start = Date.now();
        logging.info('[Background Job] send-gift-reminders started');
        try {
          const { remindedCount, skippedCount, failedCount } = await giftService.processReminders();
          logging.info(
            `[Background Job] send-gift-reminders completed in ${Date.now() - start}ms: ${remindedCount} sent, ${skippedCount} not due, ${failedCount} rejected`,
          );
        } catch (err) {
          logging.error(
            err,
            `[Background Job] send-gift-reminders failed after ${Date.now() - start}ms`,
          );
        }
      });

      domainEvents.subscribe(StartGiftDeliveryFlushEvent, async () => {
        const start = Date.now();
        try {
          const { sentCount, skippedCount, failedCount } = await giftDeliveryService.recoverPending();
          logging.info(
            `Processed ${sentCount} due gift deliveries, skipped ${skippedCount}, failed ${failedCount} in ${Date.now() - start}ms`,
          );
        } catch (err) {
          logging.error(err, 'Failed to process due gift deliveries');
        }
      });

      domainEvents.subscribe(SendGiftDeliveryEvent, async (event) => {
        const start = Date.now();
        try {
          const result = await giftDeliveryService.send(event.data.deliveryId);
          logging.info(`Gift delivery ${event.data.deliveryId} ${result} in ${Date.now() - start}ms`);
        } catch (err) {
          logging.error(err, `Failed to process gift delivery ${event.data.deliveryId}`);
        }
      });
    },

    async recoverPendingDeliveries() {
      if (rescheduleDeliveriesOnBoot) {
        try {
          await giftDeliveryService.reschedulePending();
        } catch (err) {
          logging.error(err, 'Failed to reschedule pending gift deliveries');
        }
      }

      try {
        const { sentCount, skippedCount, failedCount } = await giftDeliveryService.recoverPending();
        if (sentCount + skippedCount + failedCount > 0) {
          logging.info(
            `Gift delivery recovery: ${sentCount} sent, ${skippedCount} skipped, ${failedCount} failed`,
          );
        }
      } catch (err) {
        logging.error(err, 'Failed to recover pending gift deliveries');
      }
    },
  };
});
