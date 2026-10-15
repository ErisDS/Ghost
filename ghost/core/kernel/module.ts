import { IncorrectUsageError } from '@tryghost/errors';

/**
 * A unit of application code that boot composes: a domain, the site renderer,
 * the HTTP boundary. Mirrors the two phases of a Laravel service provider.
 *
 * - register(): construct the module's instances from injected dependencies.
 *   Nothing here may rely on another module having booted.
 * - boot(): subscribe to events, schedule jobs, start background work. Every
 *   module has been registered by the time any module boots.
 */
export interface ModuleDefinition {
  readonly name: string;
  register(): void | Promise<void>;
  boot(): void | Promise<void>;
  shutdown?(): void | Promise<void>;
}

export interface Module {
  readonly name: string;
  readonly register: () => Promise<void>;
  readonly boot: () => Promise<void>;
  readonly shutdown: () => Promise<void>;
}

/**
 * Wraps a module definition with the lifecycle guarantees boot relies on:
 * each phase runs once, concurrent calls share one attempt, a failed phase
 * can be retried, and boot() refuses to run before register() has succeeded.
 *
 * It does not order modules. Boot owns the order it calls register() and
 * boot() in, exactly as it owns the order of service init() calls today.
 */
export function defineModule(definition: ModuleDefinition): Module {
  if (!/^[a-z][a-z0-9-]*$/.test(definition.name)) {
    throw new IncorrectUsageError({
      message: `Module name "${definition.name}" must be lower-case and hyphenated.`,
    });
  }

  let registered = false;
  let registration: Promise<void> | undefined;
  let booting: Promise<void> | undefined;

  return {
    name: definition.name,
    register(): Promise<void> {
      registration ??= Promise.resolve()
        .then(() => definition.register())
        .then(() => {
          registered = true;
        })
        .catch((error) => {
          registration = undefined;
          throw error;
        });
      return registration;
    },
    async boot(): Promise<void> {
      if (!registered) {
        throw new IncorrectUsageError({
          message: `Module "${definition.name}" booted before register() completed.`,
        });
      }
      booting ??= Promise.resolve()
        .then(() => definition.boot())
        .catch((error) => {
          booting = undefined;
          throw error;
        });
      return booting;
    },
    async shutdown(): Promise<void> {
      await definition.shutdown?.();
    },
  };
}
