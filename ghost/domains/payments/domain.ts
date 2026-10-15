import { defineModule } from '../../core/kernel/module';
import { donations } from './donations';

/**
 * Wiring root for the payments domain. This is the only file in the domain
 * allowed to import application code outside it (legacy registries, other
 * domains' api.ts). Everything it reaches for is passed into the domain's
 * services as a dependency, so the implementation stays importable in tests.
 */
export default defineModule({
  name: 'payments',

  async register() {
    // Legacy registry. Bookshelf models stay central and frozen; the domain
    // receives the one model it persists through rather than the registry.
    const models = require('../../core/server/models');

    await donations.init({ DonationPaymentEventModel: models.DonationPaymentEvent });
  },

  boot() {
    // Nothing to subscribe or schedule yet. Gifts brings the first event
    // subscriptions and recurring jobs into this phase.
  },
});
