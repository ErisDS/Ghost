const {EmailAddressService} = require('./email-address-service');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('EmailAddressService', () => instance);

function init() {
    if (instance) {
        return;
    }

    const labs = require('../../../shared/labs');
    const config = require('../../../shared/config');
    const settingsHelpers = require('../settings-helpers').service;
    const validator = require('@tryghost/validator');

    instance = new EmailAddressService({
        labs,
        getManagedEmailEnabled: () => config.get('hostSettings:managedEmail:enabled') ?? false,
        getSendingDomain: () => config.get('hostSettings:managedEmail:sendingDomain') || null,
        getFallbackDomain: () => config.get('hostSettings:managedEmail:fallbackDomain') || null,
        getDefaultEmail: () => settingsHelpers.getDefaultEmail(),
        getFallbackEmail: () => config.get('hostSettings:managedEmail:fallbackAddress') || null,
        getMembersSupportAddress: () => settingsHelpers.getMembersSupportAddress(),
        isValidEmailAddress: emailAddress => validator.isEmail(emailAddress)
    });
}

module.exports = {
    init,
    service
};
