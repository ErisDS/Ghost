const StartGiftReminderFlushEvent = require('../events/start-gift-reminder-flush-event');
const { StartGiftDeliveryFlushEvent } = require('../events/start-gift-delivery-flush-event');

/**
 * Admin API controller for gifts, in api-framework's controller shape. The
 * dispatcher is injected so the controller can be built without the shared
 * event bus; api.ts builds it with a thunk into the registered runtime.
 *
 * @param {object} deps
 * @param {(event: unknown) => void} deps.dispatch
 * @returns {import('@tryghost/api-framework').Controller}
 */
function createGiftsAdminController({ dispatch }) {
  return {
    docName: 'gifts',

    flushReminders: {
      statusCode: 204,
      headers: {
        cacheInvalidate: false,
      },
      permissions: {
        docName: 'gifts',
        method: 'flushReminders',
      },
      query() {
        dispatch(StartGiftReminderFlushEvent.create());
      },
    },

    flushDeliveries: {
      statusCode: 204,
      headers: {
        cacheInvalidate: false,
      },
      permissions: {
        docName: 'gifts',
        method: 'flushDeliveries',
      },
      query() {
        dispatch(StartGiftDeliveryFlushEvent.create());
      },
    },
  };
}

module.exports = { createGiftsAdminController };
