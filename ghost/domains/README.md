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
- **Domains have a stable name.** `ghost/package.json` declares
  `"imports": { "#domains/*": ... }`, so consumers write
  `require('#domains/payments/api')` instead of a relative path that breaks
  when `core/` is flattened. Node resolves it natively (the `source` condition
  picks the `.ts` under `pnpm dev`, the default picks emitted `.js` in
  production); `tsconfig.json` mirrors it in `paths` because TypeScript's
  node10 resolution ignores `imports`; tsx applies the same `paths` under
  vitest. Node requires the `#` prefix, so `@domains/...` is not available
  without a package per domain.
- **Left central on purpose**: the `donation_payment_events` table in
  `schema.js`, the `DonationPaymentEvent` Bookshelf model. No routes to lift.
- **Gap**: CODEOWNERS entry pending the Berlin team handle.

### Gifts into payments (second move, into an existing shell)

- **A domain registers as one unit, at the earliest point any of its roots
  needed.** Gifts used to init before the services `Promise.all`, donations
  inside it. `payments.register()` now runs where gifts did. Donations moving
  earlier is harmless; the general rule is that a domain's register point is
  the earliest of its former roots' init points, so moving a root into a domain
  can only move it earlier, never later.
- **`register()` takes a context.** Gifts needs three things boot owns and the
  domain cannot build: the signed API URL, the scheduling adapter (one shared
  wrapped instance that boot also hands to post scheduling and automations), and
  the internal keys. `defineModule` gained per-phase context types; boot passes
  `{ apiUrl, schedulerAdapter, internalKeys }` to `register()` and
  `{ jobsService }` to `boot()`. This is the Laravel `$this->app` in the only
  form Ghost needs.
- **The two phases are "bind" and "start", not Laravel's register/boot.**
  Event listeners are bound at `register()`, as the old `init()` did, because
  boot skips the background phase under test and the admin flush endpoints
  dispatch those events in e2e tests. `boot()` starts activity only: delivery
  recovery and the two recurring jobs. The kernel doc now says so.
- **Job handlers stayed central.** The jobs service clears its handlers on every
  in-process boot and `register()` runs once per process, so a handler bound in
  `register()` would be lost on the test harness's second boot. The central
  `register-job-handlers.ts` keeps the two gift handlers, importing the job
  classes and the service handle from `api.ts`. A per-boot binding hook is the
  missing kernel piece; until it exists the job registry is the one registry a
  domain still writes into from outside.
- **Controllers are built in `api.ts`, lazily.** Express apps are assembled
  before services register, and the API registry's lazy getters are read at
  mount time. So `api.ts` constructs the api-framework controllers at load with
  thunks into the registered runtime, and the runtime exposes `dispatchEvent`
  instead of the event bus. The admin controller test now builds the controller
  with a stub dispatcher and no longer stubs the shared bus.
- **Routes are data; the boundary mounts them.** `gifts/http/routes.ts` declares
  method, path, middleware names and the api-framework endpoint. The admin
  routes file and the members app call `shared.mountDomainRoutes()` with their
  own middleware map and `http`. The domain never imports Express, auth or the
  API registry. Middleware names are the seam's vocabulary and need agreeing per
  app; today's are `authAdminApiWithUrl`, `loadMemberSession`, `json`.
- **Service handles replace module-level `let` exports.** Stripe, the members
  API and the gift preview all read the gift service lazily through
  `giftService.service`; the require path changed and nothing else.
- **Consumers constructed before the domain registers get lazy getters.**
  `getStripeApi`, `getMemberRepository` and `getStaffServiceEmails` are thunks in
  `GiftsDependencies` because Stripe and members are built before payments
  registers and depend on it in turn.
- **A 5k-line root cannot be made clean in the move.** Its implementation files
  still import the logging and event-bus singletons directly. `.dependency-cruiser.cjs`
  gained `domainImplementationDebt`, a per-domain list that only shrinks, so the
  move lands under the rule and the debt is visible. Six pure libraries
  (`luxon`, `handlebars`, `node:fs`, `node:path`, mongo-utils, color-utils) and
  three Ghost helpers (`case-keys`, `mailgun-message-id`, the signed flush
  scheduler class) joined the shared allowlist as kernel-tier candidates.
- **`domain.ts` legacy allowlist grew from one entry to ten.** Six are future
  domains (members, tiers, staff, stripe, settings helpers, i18n), the rest are
  `lib/` and `shared/` singletons. Each becomes an `api.ts` import or an
  injected kernel instance as its owner appears.
- **Schema fragment works; the integrity hash is unchanged by construction.**
  `schema.ts` exports the three tables and `schema.js` spreads them at the exact
  positions they held, so key order and the integrity test's hash of the schema
  object are preserved. Migrations stay central.
- **Permissions fragment is a guard, not a source.** Boot loads `fixtures.json`
  by path from config, so `permissions.ts` cannot be composed in yet.
  `permissions.test.ts` asserts the fragment matches the committed fixtures.
  Making the fragment the source needs the fixture loader to accept an object.
- **Capability folders confirmed.** Gifts moved as a folder with its 20 files,
  `jobs/`, `events/`, `email-templates/`, `CONTEXT.md` and `README.md` intact,
  beside `donations/`. The domain root holds only the contract files and the
  fragments.
- **Tests that reached into the root changed shape.** Integration tests that
  read `gifts.service` and `gifts.deliveryService` now read the `api.ts`
  handles; one that called `init()` with no options to "ensure booted" simply
  dropped the call. The boot unit tests stub `#domains/payments/domain` and
  `#domains/payments/api` instead of five service paths.
