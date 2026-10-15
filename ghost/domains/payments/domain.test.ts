import assert from 'node:assert/strict';
import sinon from 'sinon';

const { IncorrectUsageError } = require('@tryghost/errors');
const models = require('../../core/server/models');
const DOMAIN_PATH = require.resolve('./domain');
const DONATIONS_PATH = require.resolve('./donations');

describe('payments domain wiring', function () {
  const sandbox = sinon.createSandbox();
  const previous: Record<string, NodeJS.Module | undefined> = {};

  beforeEach(function () {
    for (const key of [DOMAIN_PATH, DONATIONS_PATH]) {
      previous[key] = require.cache[key];
      delete require.cache[key];
    }
  });

  afterEach(function () {
    sandbox.restore();
    for (const key of [DOMAIN_PATH, DONATIONS_PATH]) {
      delete require.cache[key];
      if (previous[key]) {
        require.cache[key] = previous[key];
      }
    }
  });

  it('registers donations with the Bookshelf model and exposes it through api.ts', async function () {
    const payments = require(DOMAIN_PATH).default;
    const { donations } = require('./api');
    const add = sandbox.stub(models.DonationPaymentEvent, 'add').resolves({});

    assert.equal(payments.name, 'payments');
    assert.throws(() => donations.service, IncorrectUsageError);

    await payments.register();
    await payments.boot();

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
  });

  it('refuses to boot before register() has completed', async function () {
    const payments = require(DOMAIN_PATH).default;
    await assert.rejects(payments.boot(), IncorrectUsageError);
  });
});
