# Payments

Payments covers money changing hands between a reader and the site: Stripe
checkout and webhooks, subscription billing, donations, gifts and offers. It
records what was paid and tells members what a payment entitles them to; it
does not decide who may read what, which is the members domain.

## Language

**Donation**:
A one-off payment with no subscription attached. Recorded as a donation
payment event, optionally linked to a member, with the attribution captured at
checkout. Staff are notified after the record is saved.
_Avoid_: tip, one-time subscription

**Gift**:
A prepaid subscription bought for someone else, delivered by email on a
chosen date, redeemed with a token, and reminded about before it lapses.
See `gifts/CONTEXT.md` for the full language of that capability.
_Avoid_: gift link (that is members' shareable access to one post)

## Status

Donations and gifts have moved here. Stripe, offers, checkout config and
machine payments still live under `core/server/services/` and will join this
domain one root at a time.
