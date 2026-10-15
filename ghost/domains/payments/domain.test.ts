import assert from 'node:assert/strict';
import sinon from 'sinon';

const { IncorrectUsageError } = require('@tryghost/errors');
const models = require('../../core/server/models');
const DOMAIN_PATH = require.resolve('./domain');
const DONATIONS_PATH = require.resolve('./donations');
const GIFTS_PATH = require.resolve('./gifts');

// What boot passes at register(). The scheduling adapter is a stub: this test
// covers wiring, not scheduling.
const context = () => ({
  apiUrl: 'https://example.com/ghost/api/admin',
  schedulerAdapter: { schedule() {}, unschedule() {}, reschedule() {}, run() {} },
  internalKeys: { getMembersKey: () => 'members-key' },
});

describe('payments domain wiring', function () {
  const sandbox = sinon.createSandbox();
  const previous: Record<string, NodeJS.Module | undefined> = {};

  beforeEach(function () {
    for (const key of [DOMAIN_PATH, DONATIONS_PATH, GIFTS_PATH]) {
      previous[key] = require.cache[key];
      delete require.cache[key];
    }
  });

  afterEach(function () {
    sandbox.restore();
    for (const key of [DOMAIN_PATH, DONATIONS_PATH, GIFTS_PATH]) {
      delete require.cache[key];
      if (previous[key]) {
        require.cache[key] = previous[key];
      }
    }
  });

  it('registers both capabilities and exposes them through api.ts', async function () {
    const payments = require(DOMAIN_PATH).default;
    const { donations } = require('./api');
    const add = sandbox.stub(models.DonationPaymentEvent, 'add').resolves({});

    assert.equal(payments.name, 'payments');
    assert.throws(() => donations.service, IncorrectUsageError);

    await payments.register(context());

    const { DonationPaymentEvent } = require('./api');
    await donations.service.save(
      DonationPaymentEvent.create({
        name: null,
        email: 'reader@example.com',
        memberId: null,
        amount: 100,
        currency: 'usd',
        donationMessage: null,
        attributionId: null,
        attributionUrl: null,
        attributionType: null,
        referrerSource: null,
        referrerMedium: null,
        referrerUrl: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
      }),
    );
    sinon.assert.calledOnce(add);

    const { giftService, giftDeliveryService } = require('./api');
    assert.equal(typeof giftService.service.startCheckout, 'function');
    assert.equal(typeof giftDeliveryService.service.recoverPending, 'function');
  });

  it('refuses to boot before register() has completed', async function () {
    const payments = require(DOMAIN_PATH).default;
    await assert.rejects(payments.boot({ jobsService: {} }), IncorrectUsageError);
  });
});
