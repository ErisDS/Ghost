const RecommendationServiceWrapper = require('./recommendation-service-wrapper');
const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (!instance) {
        const recommendationService = new RecommendationServiceWrapper();
        recommendationService.init();
        instance = recommendationService;
    }

    return instance;
}
const lifecycle = defineService({
    name: 'RecommendationsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
