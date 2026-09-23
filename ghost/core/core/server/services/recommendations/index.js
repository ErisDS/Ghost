const { createRecommendationService } = require('./recommendation-service-factory');
const { lazySingleton } = require('../../../shared/lazy-singleton');

let instance;

function init() {
  if (!instance) {
    instance = createRecommendationService();
  }
}

const service = lazySingleton('RecommendationsService', () => instance);

module.exports = { init, service };
