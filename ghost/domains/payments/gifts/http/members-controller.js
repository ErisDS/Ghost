/**
 * Members API controller for gift redemption, in api-framework's controller
 * shape. The gift controller is read through a getter so the api-framework
 * pipeline can be built before the domain registers.
 *
 * @param {object} deps
 * @param {() => import('../gift-controller').GiftController} deps.getController
 * @returns {import('@tryghost/api-framework').Controller}
 */
function createGiftsMembersController({ getController }) {
  return {
    docName: 'gifts',

    getRedeemable: {
      headers: {
        cacheInvalidate: false,
      },
      data: ['token'],
      validation: {
        data: {
          token: {
            type: 'string',
            required: true,
          },
        },
      },
      permissions: false,
      query(frame) {
        return getController().getRedeemable(frame);
      },
    },

    redeem: {
      statusCode: 200,
      headers: {
        cacheInvalidate: false,
      },
      data: ['token'],
      validation: {
        data: {
          token: {
            type: 'string',
            required: true,
          },
        },
      },
      permissions: false,
      query(frame) {
        return getController().redeem(frame);
      },
    },
  };
}

module.exports = { createGiftsMembersController };
