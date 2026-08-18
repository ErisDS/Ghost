import type {SchedulerAdapter} from '@tryghost/adapter-base-scheduling';
import type {InternalKeys} from '../internal-keys';
import {GiftBookshelfRepository} from './gift-bookshelf-repository';
import {GiftService} from './gift-service';
import {GiftReminderScheduler} from './gift-reminder-scheduler';
import {GiftEmailService} from './gift-email-service';
import {GiftController} from './gift-controller';
import {lazySingleton} from '../../../shared/lazy-singleton';

export interface GiftServiceInitOptions {
    apiUrl: string;
    schedulerAdapter: SchedulerAdapter;
    internalKeys: InternalKeys;
}

type GiftServiceFacade = GiftService & {controller: GiftController};

let instance: GiftServiceFacade | undefined;

export const service = lazySingleton('GiftService', () => instance);

export async function init(options: GiftServiceInitOptions): Promise<void> {
    if (instance) {
        return;
    }

    const {Gift: GiftModel, MemberStripeCustomer: StripeCustomerModel} = require('../../models');
    const GiftCheckoutAdapter = require('./gift-checkout-adapter');
    const membersService = require('../members').service;
    const tiersService = require('../tiers').service;
    const staffService = require('../staff').service;
    const DomainEvents = require('@tryghost/domain-events');
    const logging = require('@tryghost/logging');
    const {SubscriptionActivatedEvent} = require('../../../shared/events');
    const StartGiftReminderFlushEvent = require('./events/start-gift-reminder-flush-event');
    const StartGiftCleanupEvent = require('./events/start-gift-cleanup-event');
    const jobs = require('./jobs');

    const {GhostMailer} = require('../mail');
    const settingsCache = require('../../../shared/settings-cache');
    const labsService = require('../../../shared/labs');
    const urlUtils = require('../../../shared/url-utils').default;
    const settingsHelpers = require('../settings-helpers').service;
    const EmailAddressParser = require('../email-address/email-address-parser');
    const {blogIcon} = require('../../../server/lib/image');
    const {t} = require('../i18n');

    const repository = new GiftBookshelfRepository({
        GiftModel
    });
    const checkoutAdapter = new GiftCheckoutAdapter({
        StripeCustomerModel,
        getStripeApi: () => require('../stripe').service.api
    });

    const giftEmailService = new GiftEmailService({
        mailer: new GhostMailer(),
        settingsCache,
        urlUtils,
        getFromAddress: () => EmailAddressParser.stringify(settingsHelpers.getDefaultEmail()),
        blogIcon,
        t
    });

    const giftReminderScheduler = new GiftReminderScheduler({
        apiUrl: options.apiUrl,
        adapter: options.schedulerAdapter,
        internalKeys: options.internalKeys,
        findUnsentReminders: () => repository.findUnsentReminders()
    });

    const giftService = new GiftService({
        giftRepository: repository,
        get memberRepository() {
            return membersService.api.members;
        },
        tiersService,
        giftEmailService,
        get staffServiceEmails() {
            return staffService.api.emails;
        },
        giftReminderScheduler,
        checkoutAdapter,
        labsService,
        settingsCache
    });

    instance = Object.assign(giftService, {
        controller: new GiftController({service: giftService})
    });

    DomainEvents.subscribe(SubscriptionActivatedEvent, async (event: {data: {memberId: string}}) => {
        try {
            await giftService.handlePaidSubscriptionActivation(event.data.memberId);
        } catch (err) {
            logging.error(err, 'Failed to consume gift on paid subscription activation');
        }
    });

    DomainEvents.subscribe(StartGiftReminderFlushEvent, async () => {
        const start = Date.now();
        try {
            const {remindedCount, skippedCount, failedCount} = await giftService.processReminders();

            logging.info(`Sent ${remindedCount} gift reminders, skipped ${skippedCount}, failed ${failedCount} in ${Date.now() - start}ms`);
        } catch (err) {
            logging.error(err, 'Failed to process gift reminders');
        }
    });

    DomainEvents.subscribe(StartGiftCleanupEvent, async () => {
        const consumedStart = Date.now();
        try {
            const {consumedCount, updatedMemberCount} = await giftService.processConsumed();

            logging.info(`Consumed ${consumedCount} gifts, updated ${updatedMemberCount} members in ${Date.now() - consumedStart}ms`);
        } catch (err) {
            logging.error(err, 'Failed to process consumed gifts');
        }

        const expiredStart = Date.now();
        try {
            const {expiredCount} = await giftService.processExpired();

            logging.info(`Expired ${expiredCount} gifts in ${Date.now() - expiredStart}ms`);
        } catch (err) {
            logging.error(err, 'Failed to process expired gifts');
        }
    });

    jobs.scheduleGiftCleanupJob();
    jobs.scheduleGiftReminderJob();
}
