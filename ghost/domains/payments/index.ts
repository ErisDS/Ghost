/**
 * Public surface of the payments domain, imported as `#domains/payments`.
 * Other domains, boot and the HTTP boundary import from here and nowhere else
 * inside the domain: the package.json `imports` entries resolve nothing deeper,
 * and dependency-cruiser (domains-public-surface-only) checks relative paths.
 *
 * Service handles expose `.service` only. Consumers constructed before this
 * domain registers (Stripe, the members API) hold the handle and read it at
 * request time, as they did before the move.
 */
import { donations as donationsRoot } from './donations';
import type { DonationRepository } from './donations/donation-bookshelf-repository';
import { gifts as giftsRoot } from './gifts';
import type { GiftService } from './gifts/gift-service';
import type { GiftDeliveryService } from './gifts/gift-delivery-service';
import { adminRoutes as giftsAdminRoutes, membersRoutes as giftsMembersRoutes } from './gifts/http/routes';
import { createGiftsAdminController } from './gifts/http/admin-controller';
import { createGiftsMembersController } from './gifts/http/members-controller';

// Donations
export const donations: { readonly service: DonationRepository } = donationsRoot;
export { DonationPaymentEvent } from './donations/donation-payment-event';
export type { DonationRepository };

// Gifts
export const giftService: { readonly service: GiftService } = {
  get service() {
    return giftsRoot.service.giftService;
  },
};
export const giftDeliveryService: { readonly service: GiftDeliveryService } = {
  get service() {
    return giftsRoot.service.giftDeliveryService;
  },
};
export type { GiftService, GiftDeliveryService };
export { GIFT_DELIVERY_EMAIL_TAG } from './gifts/constants';
export { StartGiftDeliveryFlushEvent } from './gifts/events/start-gift-delivery-flush-event';
export { SendGiftDeliveryEvent } from './gifts/events/send-gift-delivery-event';
export const StartGiftReminderFlushEvent = require('./gifts/events/start-gift-reminder-flush-event');
// Job classes stay registered centrally for now: the jobs service clears its
// handlers on every in-process boot, and register() runs once per process.
export { default as CleanGiftsJob } from './gifts/jobs/clean-gifts-job';
export { default as SendGiftRemindersJob } from './gifts/jobs/send-gift-reminders-job';

/**
 * HTTP contributions. Controllers are built here, not at register(), so the
 * API registry and the Express apps can be assembled before the domain
 * registers; each controller reaches the runtime lazily, at request time.
 */
export const http = {
  gifts: {
    admin: createGiftsAdminController({
      dispatch: (event: unknown) => giftsRoot.service.dispatchEvent(event),
    }),
    members: createGiftsMembersController({
      getController: () => giftsRoot.service.controller,
    }),
    adminRoutes: giftsAdminRoutes,
    membersRoutes: giftsMembersRoutes,
  },
};
