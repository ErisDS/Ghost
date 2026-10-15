const assert = require('node:assert/strict');
const sinon = require('sinon');
const { createGiftsAdminController } = require('./admin-controller');
const StartGiftReminderFlushEvent = require('../events/start-gift-reminder-flush-event');
const { StartGiftDeliveryFlushEvent } = require('../events/start-gift-delivery-flush-event');

describe('Gifts admin controller', function () {
  let dispatch;
  let giftsController;

  beforeEach(function () {
    dispatch = sinon.stub();
    giftsController = createGiftsAdminController({ dispatch });
  });

  describe('flushReminders', function () {
    it('dispatches a StartGiftReminderFlushEvent', function () {
      const result = giftsController.flushReminders.query({});

      sinon.assert.calledOnceWithExactly(dispatch, sinon.match.instanceOf(StartGiftReminderFlushEvent));
      assert.equal(result, undefined);
    });
  });

  describe('flushDeliveries', function () {
    it('dispatches a StartGiftDeliveryFlushEvent', function () {
      const result = giftsController.flushDeliveries.query({});

      sinon.assert.calledOnceWithExactly(dispatch, sinon.match.instanceOf(StartGiftDeliveryFlushEvent));
      assert.equal(result, undefined);
    });
  });
});
