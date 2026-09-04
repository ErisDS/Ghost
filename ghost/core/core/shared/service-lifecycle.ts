import {lazySingleton} from './lazy-singleton';

type Awaitable<T> = T | PromiseLike<T>;

export interface ServiceLifecycleOptions<T extends object, Args extends unknown[]> {
    name: string;
    create(...args: Args): Awaitable<T>;
    start?(service: T): Awaitable<void>;
    stop?(service: T): Awaitable<void>;
}

export interface ServiceLifecycle<T extends object, Args extends unknown[]> {
    service: T;
    init(...args: Args): Promise<void>;
    shutdown(): Promise<void>;
}

export class ServiceLifecycleFailure extends Error {
    errors: unknown[];

    constructor(message: string, errors: unknown[]) {
        super(message);
        this.name = 'ServiceLifecycleFailure';
        this.errors = errors;
    }
}

/**
 * Owns the lifecycle of one boot-scoped service implementation.
 *
 * The stable facade is published only after startup completes. Concurrent
 * initialization and shutdown calls share their in-flight operation, and a
 * failed start is cleaned up before initialization rejects. A successful
 * shutdown makes the facade unavailable and permits a later boot to create a
 * fresh implementation.
 */
export function defineService<T extends object, Args extends unknown[] = []>({
    name,
    create,
    start,
    stop
}: ServiceLifecycleOptions<T, Args>): ServiceLifecycle<T, Args> {
    let instance: T | undefined;
    let initPromise: Promise<void> | undefined;
    let shutdownPromise: Promise<void> | undefined;

    const service = lazySingleton(name, () => instance);

    const startService = async (args: Args): Promise<void> => {
        let candidate: T | undefined;

        try {
            candidate = await create(...args);
            await start?.(candidate);
            instance = candidate;
        } catch (startError) {
            if (candidate && stop) {
                try {
                    await stop(candidate);
                } catch (stopError) {
                    throw new ServiceLifecycleFailure(`${name} failed to start and clean up`, [
                        startError,
                        stopError
                    ]);
                }
            }

            throw startError;
        }
    };

    const init = (...args: Args): Promise<void> => {
        if (instance) {
            return Promise.resolve();
        }

        if (initPromise) {
            return initPromise;
        }

        if (shutdownPromise) {
            return shutdownPromise.then(() => init(...args));
        }

        initPromise = startService(args).finally(() => {
            initPromise = undefined;
        });

        return initPromise;
    };

    const shutdown = (): Promise<void> => {
        if (shutdownPromise) {
            return shutdownPromise;
        }

        shutdownPromise = (async () => {
            if (initPromise) {
                try {
                    await initPromise;
                } catch {
                    // The init caller receives the startup error. Failed startup
                    // has already attempted cleanup and publishes no instance.
                }
            }

            const candidate = instance;
            instance = undefined;

            if (candidate) {
                await stop?.(candidate);
            }
        })().finally(() => {
            shutdownPromise = undefined;
        });

        return shutdownPromise;
    };

    return {service, init, shutdown};
}
