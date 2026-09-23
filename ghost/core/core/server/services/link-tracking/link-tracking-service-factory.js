const LinkClickRepository = require('./link-click-repository');
const PostLinkRepository = require('./post-link-repository');
const errors = require('@tryghost/errors');
const urlUtils = require('../../../shared/url-utils').default;

async function createLinkTrackingService({
  automationsApi = require('../automations/automations-api'),
} = {}) {
  const linkRedirection = require('../link-redirection').service;
  if (!linkRedirection.linkRedirectRepository) {
    throw new errors.InternalServerError({
      message: 'LinkRedirectionService should be initialised before LinkTrackingService',
    });
  }

  const models = require('../../models');
  const { MemberLinkClickEvent } = require('../../../shared/events');
  const DomainEvents = require('@tryghost/domain-events');
  const LinkClickTrackingService = require('./link-click-tracking-service');

  const postLinkRepository = new PostLinkRepository({
    LinkRedirect: models.Redirect,
    linkRedirectRepository: linkRedirection.linkRedirectRepository,
  });
  const linkClickRepository = new LinkClickRepository({
    MemberLinkClickEventModel: models.MemberClickEvent,
    Member: models.Member,
    MemberLinkClickEvent,
    DomainEvents,
  });
  const service = new LinkClickTrackingService({
    linkRedirectService: linkRedirection,
    linkClickRepository,
    postLinkRepository,
    DomainEvents,
    urlUtils,
    automationsApi,
    runInTransaction: (callback) => models.Base.transaction(callback),
  });

  await service.init();
  return Object.assign(service, { linkClickRepository });
}

module.exports = { createLinkTrackingService };
