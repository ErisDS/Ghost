import sinon from 'sinon';
import ObjectID from 'bson-objectid';

const DomainEvents = require('@tryghost/domain-events');

const models = require('../../../../../core/server/models');
const linkRedirection = require('../../../../../core/server/services/link-redirection');
const {
  createLinkTrackingService,
} = require('../../../../../core/server/services/link-tracking/link-tracking-service-factory');
const RedirectEvent = require('../../../../../core/server/services/link-redirection/redirect-event');

describe('createLinkTrackingService', function () {
  linkRedirection.init();
  const originalLinkRedirectRepository = linkRedirection.service.linkRedirectRepository;

  afterEach(function () {
    sinon.restore();
    linkRedirection.service.linkRedirectRepository = originalLinkRedirectRepository;
  });

  it('wires automation click persistence and analytics to the same transaction', async function () {
    linkRedirection.service.linkRedirectRepository = {};

    const subscribe = sinon.stub(DomainEvents, 'subscribe');
    const member = {
      id: 'member-id',
      get: sinon.stub().returns(null),
    };
    sinon.stub(models.Member, 'findOne').resolves(member);
    sinon.stub(models.MemberClickEvent, 'add').resolves({ id: ObjectID().toHexString() });
    const trackEmailClicked = sinon.stub().resolves();

    const executionPromise = Promise.resolve();
    const transacting = { executionPromise };
    const transaction = sinon
      .stub(models.Base, 'transaction')
      .callsFake(async (...args: unknown[]) => {
        const callback = args[0] as (trx: typeof transacting) => Promise<unknown>;
        return await callback(transacting);
      });

    await createLinkTrackingService({
      automationsApi: { trackEmailClicked },
    });

    const subscriber = subscribe.firstCall.args[1];
    const clickedAt = new Date('2026-07-29T12:34:56.000Z');
    const linkId = ObjectID();
    await subscriber(
      RedirectEvent.create(
        {
          url: new URL('https://example.com/destination?m=memberUuid&step=run-step-id'),
          link: {
            link_id: linkId,
            automationActionRevisionId: 'revision-id',
          },
        },
        clickedAt,
      ),
    );

    sinon.assert.calledOnce(transaction);
    sinon.assert.calledOnceWithExactly(
      models.MemberClickEvent.add,
      {
        redirect_id: linkId.toHexString(),
        member_id: 'member-id',
      },
      { transacting },
    );
    sinon.assert.calledOnceWithExactly(
      trackEmailClicked,
      {
        automationActionRevisionId: 'revision-id',
        automationRunStepId: 'run-step-id',
        memberId: 'member-id',
        clickedAt,
      },
      { transacting },
    );
  });
});
