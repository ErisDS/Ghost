# Kernel

The kernel contains application-independent framework primitives. It has no
knowledge of Ghost's features, domain models, business rules or configuration.

This directory is a temporary home for `defineService` while we prove the service
migration approach. The helper's shape and location may evolve as more services
migrate.

Application code depends on the kernel; the kernel does not depend on application
code. Kernel modules may use one another and general-purpose dependencies, but
must not import from elsewhere in the Ghost package, including `shared`.

Helpers specific to a feature stay with that feature. Shared use alone does not
make a helper part of the kernel.

## Clock

[`clock.ts`](clock.ts) exposes `getUnixTime()` for the current time in whole
seconds. Services may import it directly. Its deprecated `moment` export keeps
existing Moment Timezone operations available while services migrate; callers
can change their import without rewriting date logic. It shares the existing
library instance and leaves Ghost's timezone configuration unchanged.

## Service initialization

[`defineService(name, create)`](define-service.ts) gives a service root `init()`
and a `.service` getter. `name` identifies the service in the error raised when
it is used before initialization. The `create` callback runs when `init()` is
called, not when the service root is declared.

### Responsibilities

- **Boot** calls and awaits `init()` in the appropriate startup phase, before
  code uses the service. It must await `init()` even when `create` returns
  synchronously.
- **The author of the `create` callback** constructs the instance, completes
  any required startup work, and returns the ready instance. The callback may
  return it synchronously or through a promise. It must not recursively
  initialize its own service root.
- **Consumers** use `.service` after initialization. Reading it earlier throws.

### Readiness and retries

Concurrent calls to `init()` share one attempt. After successful initialization,
subsequent calls retain the same instance. If `create` throws or rejects,
`init()` rejects with that error and `.service` remains unavailable. A later
explicit call to `init()` invokes `create` again; there is no automatic retry.

The callback author must release resources acquired during a failed attempt
before passing the error back. For example, remove listeners already registered,
stop timers already started, or close connections opened by that attempt. Await
any asynchronous cleanup before rejecting so another attempt cannot overlap it.

`defineService` resets its own initialization state after failure. It cannot
release those resources: it has no knowledge of the callback's startup work and
has not received a ready instance. Without cleanup, a retry could leave both the
failed and successful instances listening for the same event.

See the [service-author example](../server/services/README.md#initialization)
for IndexNow's partial-subscription cleanup and its test. This failure handling
is separate from normal shutdown. Shutdown and background job registration
remain with their existing owners; `defineService` does not provide those hooks.

### Injected dependencies

`init()` forwards its argument to `create`. A root that declares what it needs
can be initialised by a wiring root (a domain's `domain.ts`) that supplies it,
and constructed in a test with a fake, without the root importing application
code itself:

```ts
export const donations = defineService(
  'Donations',
  ({ DonationPaymentEventModel }: DonationsDependencies) =>
    new DonationBookshelfRepository({ DonationPaymentEventModel }),
);
// domain.ts
await donations.init({ DonationPaymentEventModel: models.DonationPaymentEvent });
```

Roots that take no argument are unchanged: `init()` with no dependencies still
type-checks and behaves as before. A retry after failure passes whatever the
retrying caller supplies.

### Transitional extras

An optional third argument preserves helpers that still accompany a service root:

```ts
const example = defineService('Example', createService, { isAvailable });
example.extras.isAvailable();
```

The supplied object and its member types are retained. Without that argument the
root exposes only `init` and `service`. The helper never invokes extras or assigns
them lifecycle meaning. They do not change readiness, initialization retries or
resource ownership; each caller must respect the extra's documented timing.

This is a temporary migration interface. The [services guide](../server/services/README.md)
describes how to catalogue extras while their eventual ownership is established.

## Modules

[`defineModule(definition)`](module.ts) wraps a unit of application code that
boot composes: a domain, the site renderer, the HTTP boundary. Two phases,
drawn where Ghost's boot already draws them:

- `register(context)` constructs and binds: instances from injected
  dependencies, event listeners, anything that must be in place before the
  first request or the first job. It runs in boot's services phase and must not
  rely on another module having booted.
- `boot(context)` starts activity: recurring jobs, recovery of interrupted work,
  timers. It runs in boot's background phase, which boot skips under test, so a
  module's behaviour must not depend on it having run.
- `shutdown()` is optional and releases what `boot()` started.

The context is whatever boot owns and the module cannot construct for itself
(the jobs service, the scheduling adapter, the server). Each phase has its own
context type because boot's phases have different state in scope.

The helper gives each phase the guarantees `defineService` gives `init()`:
one attempt shared by concurrent callers, a retry after failure, and an error
when `boot()` is called before `register()` has completed. It does not order
modules; boot owns the order, as it owns the order of service `init()` calls.

Job handlers are a declaration, not a phase: `jobs()` returns the module's
`JobHandlerDeclaration`s (built with `declareJobHandler(JobClass, handle,
options?)`) and boot binds them to the jobs service on every boot, after
`register()`. That is what lets handlers live with their module while the jobs
service clears its registry on an in-process restart. Handlers reach the
module's instances lazily, so declaring one runs nothing.

A domain's `module.ts` default-exports one `Module`. See
[`ghost/domains/README.md`](../../domains/README.md).
