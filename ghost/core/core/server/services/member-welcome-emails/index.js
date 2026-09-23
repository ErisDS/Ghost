const MemberWelcomeEmailService = require('./service');
const { lazySingleton } = require('../../../shared/lazy-singleton');

let instance;

function init() {
  if (!instance) {
    const i18nLib = require('@tryghost/i18n');
    const events = require('../../lib/common/events');
    const settingsCache = require('../../../shared/settings-cache');
    const SingleUseTokenProvider = require('../members/single-use-token-provider');
    const models = require('../../models');

    const i18n = i18nLib(settingsCache.get('locale') || 'en', 'ghost');
    events.on('settings.locale.edited', (model) => {
      i18n.changeLanguage(model.get('value'));
    });

    instance = new MemberWelcomeEmailService({
      t: i18n.t,
      dir: i18n.dir.bind(i18n),
      singleUseTokenProvider: new SingleUseTokenProvider({
        SingleUseTokenModel: models.SingleUseToken,
        validityPeriod: 24 * 60 * 60 * 1000,
        validityPeriodAfterUsage: 10 * 60 * 1000,
        maxUsageCount: 7,
      }),
    });
  }
}

const service = lazySingleton('MemberWelcomeEmailService', () => instance);

module.exports = { init, service };
