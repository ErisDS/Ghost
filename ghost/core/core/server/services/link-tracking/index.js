const { createLinkTrackingService } = require('./link-tracking-service-factory');
const { lazySingleton } = require('../../../shared/lazy-singleton');

let instance;
let initPromise;

async function init() {
  if (instance) {
    return;
  }

  if (!initPromise) {
    initPromise = createLinkTrackingService().then((linkTrackingService) => {
      instance = linkTrackingService;
    });
  }

  try {
    await initPromise;
  } catch (error) {
    initPromise = undefined;
    throw error;
  }
}

const service = lazySingleton('LinkTrackingService', () => instance);

module.exports = { init, service };
