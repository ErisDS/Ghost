const RecommendationServiceWrapper = require('./recommendation-service-wrapper');
const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

function init() {
    if (!instance) {
        const recommendationService = new RecommendationServiceWrapper();
        recommendationService.init();
        instance = recommendationService;
    }
}

const service = lazySingleton('RecommendationsService', () => instance);

module.exports = {init, service};
