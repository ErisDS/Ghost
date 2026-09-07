const {defineService} = require('../../../shared/service-lifecycle');

const lifecycle = defineService({
    name: 'DonationRepository',
    create() {
        const {DonationPaymentEvent: DonationPaymentEventModel} = require('../../models');
        const {DonationBookshelfRepository} = require('./donation-bookshelf-repository');

        return new DonationBookshelfRepository({
            DonationPaymentEventModel
        });
    }
});

module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
