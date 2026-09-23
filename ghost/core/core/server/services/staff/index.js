const DomainEvents = require('@tryghost/domain-events');
const labs = require('../../../shared/labs');
const { lazySingleton } = require('../../../shared/lazy-singleton');

let instance;

function init() {
  if (!instance) {
    const StaffService = require('./staff-service');

    const logging = require('@tryghost/logging');
    const models = require('../../models');
    const memberAttribution = require('../member-attribution');
    const { GhostMailer } = require('../mail');
    const mailer = new GhostMailer();
    const settingsCache = require('../../../shared/settings-cache');
    const urlUtils = require('../../../shared/url-utils').default;
    const { blogIcon } = require('../../../server/lib/image');
    const settingsHelpers = require('../settings-helpers').service;

    instance = new StaffService({
      logging,
      models,
      mailer,
      settingsHelpers,
      settingsCache,
      urlUtils,
      blogIcon,
      DomainEvents,
      memberAttributionService: memberAttribution.service,
      labs,
    });

    instance.subscribeEvents();
  }
}

const service = lazySingleton('StaffService', () => instance);

module.exports = { init, service };
