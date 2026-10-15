import { IncorrectUsageError } from '@tryghost/errors';

interface ServiceRoot<Service, Dependencies = void> {
  readonly init: (dependencies: Dependencies) => Promise<void>;
  readonly service: Service;
}

/**
 * Provides init() and a .service getter for one application-owned instance.
 *
 * @param name - Service name used when reporting access before initialization.
 * @param create - Returns a fully initialized instance, synchronously or asynchronously.
 * It receives whatever the caller passes to init(), so a domain's wiring root can
 * supply application dependencies without the implementation importing them.
 * If startup fails, this callback must release any resources it acquired before
 * throwing or rejecting. defineService allows retries but cannot perform that cleanup.
 * An optional extras object groups transitional helpers without invoking them.
 * @see [Service initialization](./README.md#service-initialization)
 */
export function defineService<Service, Dependencies = void>(
  name: string,
  create: (dependencies: Dependencies) => Service | Promise<Service>,
): ServiceRoot<Service, Dependencies>;
export function defineService<Service, Dependencies = void, Extras extends object = object>(
  name: string,
  create: (dependencies: Dependencies) => Service | Promise<Service>,
  extras: Extras,
): ServiceRoot<Service, Dependencies> & { readonly extras: Extras };
export function defineService<Service, Dependencies = void, Extras extends object = object>(
  name: string,
  create: (dependencies: Dependencies) => Service | Promise<Service>,
  extras?: Extras,
) {
  let instance: Service | undefined;
  let initialization: Promise<void> | undefined;

  async function createService(dependencies: Dependencies): Promise<void> {
    instance = await create(dependencies);
  }

  const root = {
    init(dependencies: Dependencies): Promise<void> {
      initialization ??= createService(dependencies).catch((error) => {
        initialization = undefined;
        throw error;
      });
      return initialization;
    },
    get service(): Service {
      if (instance === undefined) {
        throw new IncorrectUsageError({
          message: `${name} used before init(). Call init() from boot first.`,
        });
      }
      return instance;
    },
  };

  return extras === undefined ? root : Object.assign(root, { extras });
}
