let repository;

function init() {
    if (repository) {
        return repository;
    }

    const {DonationPaymentEvent: DonationPaymentEventModel} = require('../../models');
    const {DonationBookshelfRepository} = require('./donation-bookshelf-repository');

    repository = new DonationBookshelfRepository({
        DonationPaymentEventModel
    });

    return repository;
}

function getRepository() {
    if (!repository) {
        const {InternalServerError} = require('@tryghost/errors');
        throw new InternalServerError({
            message: 'Donation repository must be initialized before use'
        });
    }

    return repository;
}

module.exports = {
    init,
    getRepository
};
