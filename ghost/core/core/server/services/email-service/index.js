const { createEmailService } = require('./email-service-factory');
const { lazySingleton } = require('../../../shared/lazy-singleton');

let instance;

function init(options) {
  if (!instance) {
    instance = createEmailService(options);
  }
}

const service = lazySingleton('EmailService', () => instance);

module.exports = { init, service };
