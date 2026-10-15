/**
 * Public surface of the payments domain. Other domains, boot and the HTTP
 * boundary import from here and nowhere else inside the domain
 * (dependency-cruiser: domains-public-surface-only).
 */
import { donations as donationsRoot } from './donations';
import type { DonationRepository } from './donations/donation-bookshelf-repository';

/**
 * The donation repository, ready once the domain has registered. Exposed as a
 * read-only view: callers hold the root and read `.service` when they need it,
 * so a consumer constructed before this domain registers (Stripe is one) does
 * not capture an unready instance. init() is deliberately not on the type.
 */
export const donations: { readonly service: DonationRepository } = donationsRoot;

export { DonationPaymentEvent } from './donations/donation-payment-event';
export type { DonationRepository };
