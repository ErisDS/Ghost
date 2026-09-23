const DomainEvents = require('@tryghost/domain-events');
const MentionCreatedEvent = require('../mentions/mention-created-event');
const logging = require('@tryghost/logging');

function createRecommendationService() {
  const config = require('../../../shared/config');
  if (config.get('services:recommendations:enabled') === false) {
    logging.info('[Recommendations] Service is disabled via config');
    return;
  }

  const urlUtils = require('../../../shared/url-utils').default;
  const models = require('../../models');
  const sentry = require('../../../shared/sentry');
  const settings = require('../settings').service;
  const RecommendationEnablerService = require('./recommendation-enabler-service');

  const {
    BookshelfRecommendationRepository,
    RecommendationService,
    RecommendationController,
    WellknownService,
    BookshelfClickEventRepository,
    IncomingRecommendationController,
    IncomingRecommendationService,
    IncomingRecommendationEmailRenderer,
    RecommendationMetadataService,
  } = require('./service');

  const mentions = require('../mentions').service;

  if (!mentions.sendingService || !mentions.api) {
    // eslint-disable-next-line ghost/ghost-custom/no-native-error
    throw new Error(
      'MentionSendingService not initialized, but this is a dependency of RecommendationService. Check boot order.',
    );
  }

  const wellknownService = new WellknownService({
    dir: config.getContentPath('public'),
    urlUtils,
  });

  const settingsService = settings.getSettingsBREADServiceInstance();
  const recommendationEnablerService = new RecommendationEnablerService({ settingsService });

  const repository = new BookshelfRecommendationRepository(models.Recommendation, {
    sentry,
  });

  const clickEventRepository = new BookshelfClickEventRepository(models.RecommendationClickEvent, {
    sentry,
  });
  const subscribeEventRepository = new BookshelfClickEventRepository(
    models.RecommendationSubscribeEvent,
    {
      sentry,
    },
  );

  const oembedService = require('../oembed').service;
  const externalRequest = require('../../../server/lib/request-external.js');

  const recommendationMetadataService = new RecommendationMetadataService({
    oembedService,
    externalRequest,
  });

  const service = new RecommendationService({
    repository: repository,
    recommendationEnablerService,
    wellknownService,
    mentionSendingService: mentions.sendingService,
    clickEventRepository: clickEventRepository,
    subscribeEventRepository: subscribeEventRepository,
    recommendationMetadataService,
  });

  const mail = require('../mail');
  const mailer = new mail.GhostMailer();
  const emailService = {
    async send(to, subject, html, text) {
      return mailer.send({
        to,
        subject,
        html,
        text,
      });
    },
  };

  const incomingRecommendationService = new IncomingRecommendationService({
    mentionsApi: mentions.api,
    recommendationService: service,
    emailService,
    async getEmailRecipients() {
      const users = await models.User.getEmailAlertUsers('recommendation-received');
      return users.map((model) => {
        return {
          email: model.email,
          slug: model.slug,
        };
      });
    },
    emailRenderer: new IncomingRecommendationEmailRenderer({
      staffService: require('../staff').service,
    }),
  });

  const controller = new RecommendationController({
    service: service,
  });

  const incomingRecommendationController = new IncomingRecommendationController({
    service: incomingRecommendationService,
  });

  service.init().catch(logging.error);
  incomingRecommendationService.init().catch(logging.error);

  const PATH_SUFFIX = '/.well-known/recommendations.json';

  function isRecommendationUrl(url) {
    return url.pathname.endsWith(PATH_SUFFIX);
  }

  // Add mapper to WebmentionMetadata
  mentions.metadata.addMapper((url) => {
    if (isRecommendationUrl(url)) {
      // Strip p
      const newUrl = new URL(url.toString());
      newUrl.pathname = newUrl.pathname.slice(0, -PATH_SUFFIX.length);
      return newUrl;
    }
  });

  // Listen for incoming webmentions
  DomainEvents.subscribe(MentionCreatedEvent, async (event) => {
    // Check if this is a recommendation
    if (event.data.mention.verified && isRecommendationUrl(event.data.mention.source)) {
      logging.info(
        '[INCOMING RECOMMENDATION] Received recommendation from ' + event.data.mention.source,
      );
      await incomingRecommendationService.sendRecommendationEmail(event.data.mention);
    }
  });

  return Object.assign(service, {
    repository,
    clickEventRepository,
    subscribeEventRepository,
    controller,
    incomingRecommendationController,
    incomingRecommendationService,
  });
}

module.exports = { createRecommendationService };
