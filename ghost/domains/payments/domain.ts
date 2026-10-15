import type { SchedulerAdapter } from '@tryghost/adapter-base-scheduling';
import type { JobsService } from '../../core/server/services/jobs-service/jobs-service';
import type { InternalKeys } from '../../core/server/services/internal-keys';
import { defineModule } from '../../core/kernel/module';
import { donations } from './donations';
import { gifts } from './gifts';

/** What boot owns and the domain cannot construct for itself. */
export interface PaymentsRegisterContext {
  apiUrl: string;
  schedulerAdapter: SchedulerAdapter & { rescheduleOnBoot?: boolean };
  internalKeys: InternalKeys;
}

export interface PaymentsBootContext {
  jobsService: JobsService;
}

/**
 * Wiring root for the payments domain. This is the only file in the domain
 * allowed to import application code outside it (legacy registries, other
 * domains' api.ts). Everything it reaches for is passed into the domain's
 * services as a dependency, so the implementation stays importable in tests.
 */
export default defineModule<PaymentsRegisterContext, PaymentsBootContext>({
  name: 'payments',

  async register({ apiUrl, schedulerAdapter, internalKeys }) {
    // Legacy registries and singletons. Each line here is an entry in this
    // domain's allowlist in .dependency-cruiser.cjs, and each is a candidate
    // to become an api.ts import once its owner is a domain.
    const models = require('../../core/server/models');
    const membersService = require('../../core/server/services/members');
    const tiersService = require('../../core/server/services/tiers');
    const staffService = require('../../core/server/services/staff');
    const settingsHelpers = require('../../core/server/services/settings-helpers');
    const emailAddressParser = require('../../core/server/services/email-address/email-address-parser');
    const emailAnalyticsJobs = require('../../core/server/services/email-analytics/jobs');
    const { t } = require('../../core/server/services/i18n');
    const { GhostMailer } = require('../../core/server/lib/mail');
    const MailgunClient = require('../../core/server/lib/mailgun/mailgun-client');
    const { blogIcon } = require('../../core/server/lib/image');
    const config = require('../../core/shared/config');
    const settingsCache = require('../../core/shared/settings-cache');
    const urlUtils = require('../../core/shared/url-utils').default;
    const { SubscriptionActivatedEvent } = require('../../core/shared/events');
    const domainEvents = require('@tryghost/domain-events');
    const logging = require('@tryghost/logging');

    await donations.init({ DonationPaymentEventModel: models.DonationPaymentEvent });

    await gifts.init({
      models: {
        knex: models.Base.knex,
        GiftModel: models.Gift,
        GiftDeliveryModel: models.GiftDelivery,
        StripeCustomerModel: models.MemberStripeCustomer,
      },
      // Stripe is constructed before this domain registers and reads gifts
      // lazily; the reverse dependency is lazy too.
      getStripeApi: () => require('../../core/server/services/stripe').api,
      getMemberRepository: () => membersService.api.members,
      getStaffServiceEmails: () => staffService.api.emails,
      tiersService,
      settingsCache,
      email: {
        config,
        transactionalMailer: new GhostMailer(),
        bulkMailer: new MailgunClient({ config, settings: settingsCache }),
        settingsCache,
        urlUtils,
        getFromAddress: () => emailAddressParser.stringify(settingsHelpers.getDefaultEmail()),
        getReplyToAddress: () => settingsHelpers.getMembersSupportAddress(),
        blogIcon,
        t,
      },
      emailAnalytics: {
        schedule: () => emailAnalyticsJobs.scheduleRecurringGiftDeliveriesJob(true),
      },
      scheduling: { apiUrl, adapter: schedulerAdapter, internalKeys },
      domainEvents,
      SubscriptionActivatedEvent,
      logging,
    });

    // Bind listeners now, as the old init() did: the admin flush endpoints
    // dispatch these events and must work in environments where boot() never
    // runs (tests skip the background phase).
    gifts.service.subscribeEvents();
  },

  async boot({ jobsService }) {
    const logging = require('@tryghost/logging');
    const giftJobs = require('./gifts/jobs');

    // Not awaited: recovery sends sequentially and must not hold up the rest
    // of the background phase. Each step below is guarded so an unrelated
    // failure cannot leave gifts uncleaned for the life of the process.
    void gifts.service.recoverPendingDeliveries();

    try {
      await giftJobs.scheduleGiftCleanupJob(jobsService);
    } catch (err) {
      logging.error(err);
    }

    try {
      await giftJobs.scheduleGiftReminderJob(jobsService);
    } catch (err) {
      logging.error(err);
    }
  },
});
