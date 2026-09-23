const NewslettersService = require('./newsletters-service.js');
const {lazySingleton} = require('../../../shared/lazy-singleton');

const MAGIC_LINK_TOKEN_VALIDITY = 24 * 60 * 60 * 1000;
const MAGIC_LINK_TOKEN_VALIDITY_AFTER_USAGE = 10 * 60 * 1000;
const MAGIC_LINK_TOKEN_MAX_USAGE_COUNT = 7;

let instance;

const service = lazySingleton('NewslettersService', () => instance);

function init() {
    if (instance) {
        return;
    }

    const SingleUseTokenProvider = require('../members/single-use-token-provider');
    const mail = require('../mail');
    const models = require('../../models');
    const urlUtils = require('../../../shared/url-utils').default;
    const limitService = require('../limits');
    const labs = require('../../../shared/labs');
    const emailAddressService = require('../email-address').service;

    instance = new NewslettersService({
        NewsletterModel: models.Newsletter,
        MemberModel: models.Member,
        mail,
        singleUseTokenProvider: new SingleUseTokenProvider({
            SingleUseTokenModel: models.SingleUseToken,
            validityPeriod: MAGIC_LINK_TOKEN_VALIDITY,
            validityPeriodAfterUsage: MAGIC_LINK_TOKEN_VALIDITY_AFTER_USAGE,
            maxUsageCount: MAGIC_LINK_TOKEN_MAX_USAGE_COUNT
        }),
        urlUtils,
        limitService,
        labs,
        emailAddressService
    });
}

module.exports = {
    init,
    service
};
