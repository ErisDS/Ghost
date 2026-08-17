const {lazySingleton} = require('../../../shared/lazy-singleton');

let repository;

const service = lazySingleton('DonationRepository', () => repository);

function init() {
    if (repository) {
        return;
    }

    const {DonationPaymentEvent: DonationPaymentEventModel} = require('../../models');
    const {DonationBookshelfRepository} = require('./donation-bookshelf-repository');

    repository = new DonationBookshelfRepository({
        DonationPaymentEventModel
    });
}

module.exports = {
    init,
    service
};
