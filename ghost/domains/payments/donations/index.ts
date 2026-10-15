import { defineService } from '../../../core/kernel/define-service';
import {
  DonationBookshelfRepository,
  type DonationPaymentEventBookshelfModel,
} from './donation-bookshelf-repository';

/** Application dependencies the payments domain supplies when it registers. */
export interface DonationsDependencies {
  DonationPaymentEventModel: DonationPaymentEventBookshelfModel;
}

/**
 * One ready donation repository per process. The domain's wiring root calls
 * init() with the Bookshelf model; nothing in this folder imports application
 * code, so the implementation can be constructed in a test with a fake model.
 */
export const donations = defineService(
  'Donations',
  ({ DonationPaymentEventModel }: DonationsDependencies) =>
    new DonationBookshelfRepository({ DonationPaymentEventModel }),
);
