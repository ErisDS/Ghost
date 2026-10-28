import { IncorrectUsageError } from '@tryghost/errors';

/**
 * A unit of application code that boot composes: a domain, the site renderer,
 * the HTTP boundary. Two phases, in the spirit of a Laravel service provider
 * but drawn where Ghost's boot already draws them:
 *
 * - register(context): construct and bind. Build the module's instances from
 *   injected dependencies, subscribe event listeners, register job handlers.
 *   Nothing here starts activity, and nothing may rely on another module having
 *   booted. Runs in boot's services phase, before the jobs service starts.
 * - boot(context): start activity. Schedule recurring jobs, resume interrupted
 *   work, start timers. Runs in boot's background phase, which boot skips
 *   under test, so the module's behaviour must not depend on it having run.
 *
 * The context is whatever boot owns and the module cannot construct for
 * itself: the jobs service, the scheduling adapter, the server. Each phase
 * gets its own context type because boot's phases have different state.
 */
export interface ModuleDefinition<RegisterContext = void, BootContext = void> {
  readonly name: string;
  register(context: RegisterContext): void | Promise<void>;
  boot(context: BootContext): void | Promise<void>;
  shutdown?(): void | Promise<void>;
  /**
   * Job handlers the module contributes. Boot binds them to the jobs service
   * on every boot, after register(), so they survive the jobs service clearing
   * its handlers on an in-process restart. Handlers reach the module's
   * instances lazily; nothing here runs until a job is processed.
   */
  jobs?(): readonly JobHandlerDeclaration[];
}

export interface Module<RegisterContext = void, BootContext = void> {
  readonly name: string;
  readonly register: (context: RegisterContext) => Promise<void>;
  readonly boot: (context: BootContext) => Promise<void>;
  readonly shutdown: () => Promise<void>;
  readonly jobs: () => readonly JobHandlerDeclaration[];
}

/** A job class with the static type name the jobs service keys handlers by. */
export interface JobClass<Job = unknown> {
  readonly type: string;
  new (...args: never[]): Job;
}

export interface JobHandlerDeclaration {
  readonly job: JobClass;
  // Contravariant parameter: any handler for a specific job is assignable.
  readonly handle: (job: never) => void | Promise<void>;
  readonly options?: Readonly<Record<string, unknown>>;
}

/** Builds one typed job handler declaration for a module's jobs() list. */
export function declareJobHandler<Job>(
  job: JobClass<Job>,
  handle: (job: Job) => void | Promise<void>,
  options?: Readonly<Record<string, unknown>>,
): JobHandlerDeclaration {
  return options === undefined ? { job, handle } : { job, handle, options };
}

/**
 * Wraps a module definition with the lifecycle guarantees boot relies on:
 * each phase runs once, concurrent calls share one attempt, a failed phase
 * can be retried, and boot() refuses to run before register() has succeeded.
 *
 * It does not order modules. Boot owns the order it calls register() and
 * boot() in, exactly as it owns the order of service init() calls today.
 */
export function defineModule<RegisterContext = void, BootContext = void>(
  definition: ModuleDefinition<RegisterContext, BootContext>,
): Module<RegisterContext, BootContext> {
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
    register(context: RegisterContext): Promise<void> {
      registration ??= Promise.resolve()
        .then(() => definition.register(context))
        .then(() => {
          registered = true;
        })
        .catch((error) => {
          registration = undefined;
          throw error;
        });
      return registration;
    },
    async boot(context: BootContext): Promise<void> {
      if (!registered) {
        throw new IncorrectUsageError({
          message: `Module "${definition.name}" booted before register() completed.`,
        });
      }
      booting ??= Promise.resolve()
        .then(() => definition.boot(context))
        .catch((error) => {
          booting = undefined;
          throw error;
        });
      return booting;
    },
    async shutdown(): Promise<void> {
      await definition.shutdown?.();
    },
    jobs(): readonly JobHandlerDeclaration[] {
      return definition.jobs?.() ?? [];
    },
  };
}
