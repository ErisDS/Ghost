const {EmailAddressService} = require('./email-address-service');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
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

    return instance;
}
const lifecycle = defineService({
    name: 'EmailAddressService',
    create
});


module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
