/**
 * Table definitions the payments domain contributes to the database schema.
 * core/server/data/schema/schema.js spreads these at the positions the tables
 * held before the move, so table order (and the schema integrity hash) is
 * unchanged. Migrations stay central and Ghost-versioned.
 */
export const donationPaymentEventsTable = {
  donation_payment_events: {
    id: { type: 'string', maxlength: 24, nullable: false, primary: true },
    name: { type: 'string', maxlength: 191, nullable: true },
    email: {
      type: 'string',
      maxlength: 191,
      nullable: false,
      unique: false,
      validations: { isEmail: true },
    },
    member_id: {
      type: 'string',
      maxlength: 24,
      nullable: true,
      unique: false,
      references: 'members.id',
      setNullDelete: true,
    },
    amount: { type: 'integer', nullable: false },
    currency: { type: 'string', maxlength: 50, nullable: false },
    // attribution values from ghost-history (member attribution tracking script)
    attribution_id: { type: 'string', maxlength: 24, nullable: true },
    attribution_type: {
      type: 'string',
      maxlength: 50,
      nullable: true,
      validations: {
        isIn: [['url', 'post', 'page', 'author', 'tag']],
      },
    },
    attribution_url: { type: 'string', maxlength: 2000, nullable: true },
    // referrer values from browser, processed by our referrerParser library
    referrer_source: { type: 'string', maxlength: 191, nullable: true },
    referrer_medium: { type: 'string', maxlength: 191, nullable: true },
    referrer_url: { type: 'string', maxlength: 2000, nullable: true },
    // raw values from URL query parameters
    utm_source: { type: 'string', maxlength: 191, nullable: true },
    utm_medium: { type: 'string', maxlength: 191, nullable: true },
    utm_campaign: { type: 'string', maxlength: 191, nullable: true },
    utm_term: { type: 'string', maxlength: 191, nullable: true },
    utm_content: { type: 'string', maxlength: 191, nullable: true },
    created_at: { type: 'dateTime', nullable: false },
    donation_message: { type: 'string', maxlength: 255, nullable: true }, // https://docs.stripe.com/payments/checkout/custom-fields
  },
};

export const giftTables = {
  gifts: {
    id: { type: 'string', maxlength: 24, nullable: false, primary: true },
    token: { type: 'string', maxlength: 48, nullable: false, unique: true },

    buyer_email: { type: 'string', maxlength: 191, nullable: true, validations: { isEmail: true } },
    buyer_member_id: {
      type: 'string',
      maxlength: 24,
      nullable: true,
      unique: false,
      references: 'members.id',
      setNullDelete: true,
    },
    buyer_name: { type: 'string', maxlength: 191, nullable: true },
    recipient_name: { type: 'string', maxlength: 191, nullable: true },
    personal_message: { type: 'text', maxlength: 500, nullable: true },

    redeemer_member_id: {
      type: 'string',
      maxlength: 24,
      nullable: true,
      unique: false,
      references: 'members.id',
      setNullDelete: true,
    },

    tier_id: {
      type: 'string',
      maxlength: 24,
      nullable: false,
      unique: false,
      references: 'products.id',
    },
    cadence: {
      type: 'string',
      maxlength: 50,
      nullable: false,
      validations: {
        isIn: [['month', 'year']],
      },
    },
    duration: { type: 'integer', nullable: false, unsigned: true },

    currency: { type: 'string', maxlength: 50, nullable: false },
    amount: { type: 'integer', nullable: false, unsigned: true },

    stripe_checkout_session_id: { type: 'string', maxlength: 255, nullable: true, unique: true },
    stripe_payment_intent_id: { type: 'string', maxlength: 255, nullable: true, unique: true },

    checkout_started_at: { type: 'dateTime', nullable: true },
    consumes_at: { type: 'dateTime', nullable: true },
    expires_at: { type: 'dateTime', nullable: true },

    status: {
      type: 'string',
      maxlength: 50,
      nullable: false,
      validations: {
        isIn: [['payment_pending', 'purchased', 'redeemed', 'consumed', 'expired', 'refunded']],
      },
    },
    purchased_at: { type: 'dateTime', nullable: true },
    redeemed_at: { type: 'dateTime', nullable: true },
    consumed_at: { type: 'dateTime', nullable: true },
    expired_at: { type: 'dateTime', nullable: true },
    refunded_at: { type: 'dateTime', nullable: true },
    consumes_soon_reminder_sent_at: { type: 'dateTime', nullable: true },
    '@@INDEXES@@': [
      ['status', 'consumes_at'],
      ['status', 'expires_at'],
      ['status', 'checkout_started_at'],
    ],
  },
  gift_deliveries: {
    id: { type: 'string', maxlength: 24, nullable: false, primary: true },
    gift_id: {
      type: 'string',
      maxlength: 24,
      nullable: false,
      unique: true,
      references: 'gifts.id',
      cascadeDelete: true,
    },
    recipient_email: {
      type: 'string',
      maxlength: 191,
      nullable: false,
      validations: { isEmail: true },
    },
    status: {
      type: 'string',
      maxlength: 50,
      nullable: false,
      defaultTo: 'pending',
      validations: {
        isIn: [['pending', 'sending', 'sent', 'failed', 'cancelled']],
      },
    },
    scheduled_at: { type: 'dateTime', nullable: true },
    started_at: { type: 'dateTime', nullable: true },
    email_sent_at: { type: 'dateTime', nullable: true },
    email_provider_message_id: { type: 'string', maxlength: 1000, nullable: true },
    outcome: {
      type: 'string',
      maxlength: 50,
      nullable: false,
      defaultTo: 'unknown',
      validations: {
        isIn: [['unknown', 'delivered', 'temporary_failed', 'permanent_failed']],
      },
    },
    outcome_at: { type: 'dateTime', nullable: true },
    outcome_error: { type: 'text', maxlength: 65535, nullable: true },
    '@@INDEXES@@': [
      ['status', 'started_at'],
      ['status', 'scheduled_at'],
      { columns: ['email_provider_message_id'], length: 31 },
    ],
  },
};
