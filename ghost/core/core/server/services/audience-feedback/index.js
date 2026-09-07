const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const urlUtils = require('../../../shared/url-utils').default;
    const urlService = require('../url').service;
    const AudienceFeedbackService = require('./audience-feedback-service');
    const AudienceFeedbackController = require('./audience-feedback-controller');
    const Feedback = require('./feedback');
    const FeedbackRepository = require('./feedback-repository');
    const models = require('../../models');

    const repository = new FeedbackRepository({
        Member: models.Member,
        MemberFeedback: models.MemberFeedback,
        Feedback,
        Post: models.Post
    });

    const audienceFeedbackService = new AudienceFeedbackService({
        urlService,
        config: {baseURL: new URL(urlUtils.urlFor('home', true))}
    });

    const controller = new AudienceFeedbackController({
        repository,
        audienceFeedbackService
    });

    instance = {
        service: audienceFeedbackService,
        controller,
        repository
    };

    return instance;
}
const lifecycle = defineService({
    name: 'AudienceFeedbackService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
