# Ghost domains

A domain is a bounded context of Ghost's business logic, owned by one team,
living at `ghost/domains/<name>/`. This directory is the target home for the
code under `core/server/services/`; roots move here one at a time.

## The contract

Every domain directory contains exactly these three files at its root, plus
any number of capability folders:

| File         | Role                                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain.ts`  | Wiring root. Default-exports a `Module` from the kernel. `register()` constructs the domain's services from injected dependencies; `boot()` subscribes events and schedules jobs. |
| `api.ts`     | Public surface. The only file other domains, boot and the HTTP boundary may import.                                                                                              |
| `CONTEXT.md` | The bounded context and its language, as the gifts and email services carry today.                                                                                               |

Capability folders (`donations/`, later `gifts/`, `stripe/`) hold the
implementation: services, repositories, entities, events, jobs, templates,
controllers and co-located `*.test.ts` files. A capability's `index.ts` is an
implementation file, not a second wiring root.

`pnpm lint:domains` (root) checks the shape. `pnpm lint:boundaries` enforces the
import rules below.

## Import rules

Enforced by dependency-cruiser (`.dependency-cruiser.cjs`, rules prefixed
`domain-` and `domains-`):

- **Implementation** files import only their own domain, `core/kernel`,
  type-only imports, another domain's `api.ts`, and the explicit library
  allowlist shared with migrated services. Application dependencies (models,
  settings, config, other services) are wired in `domain.ts` and injected.
- **`domain.ts`** may import legacy application code only from its named
  allowlist in `domainLegacyAllowlist`. The list is per domain, reviewed on
  every addition, and only shrinks per entry.
- **Everything outside `ghost/domains`** imports a domain only via `api.ts`
  (consumers) or `domain.ts` (boot).
- **Domains cross** into each other only via `api.ts`.

## What we learned

Each move adds a section here. The rules above were written after the move
that needed them, not before.

### Donations into payments (first move)

- **`defineService` needed one change**: `init()` now forwards an argument to
  the `create` callback, so a domain's `domain.ts` can supply dependencies to a
  root that imports no application code. Before, the root's `index.ts` was the
  wiring and required `models` itself.
- **The service root lives in the capability folder, not in `domain.ts`.**
  `domain.ts` must call `init()` and `api.ts` must expose `.service`; neither may
  import the other, so the root object has to sit in a third file both can
  reach. `donations/index.ts` is that file.
- **`api.ts` narrows the type, not the object.** It exposes the root as
  `{ readonly service }` so `init()` is not on the public type. At runtime it is
  the same object. Good enough for now; a real split would need the kernel to
  separate the handle boot initialises from the accessor consumers hold.
- **Capability folders, not layer folders.** Moving `services/donations/` as a
  folder keeps `git mv` history, keeps the files' existing names, and leaves
  room for gifts and stripe beside it. A domain made of several former service
  roots groups by capability first and by layer inside each capability.
- **One deep import became a public one.** The Stripe checkout webhook imported
  `donations/donation-payment-event` directly; it now imports the class from
  `api.ts`. Finding that is what `domains-public-surface-only` is for.
- **Boot got a second phase call.** `payments.register()` replaces
  `donationService.init()` in the services phase; `payments.boot()` was added
  to the background phase so the domain owns its subscriptions and jobs once it
  has any. Boot still orders modules by hand.
- **Tooling that assumed `core/`:** `tsconfig.json` include, `package.json`
  `files`, `scripts/prune.mts`, the eslint globs, the vitest unit include, the
  strict-mode test loader and the dependency resolver's emitted-JS scan all had
  `core/` hard-coded. Each gained `domains/`.
- **Left central on purpose**: the `donation_payment_events` table in
  `schema.js`, the `DonationPaymentEvent` Bookshelf model. No routes to lift.
- **Gap**: CODEOWNERS entry pending the Berlin team handle.
