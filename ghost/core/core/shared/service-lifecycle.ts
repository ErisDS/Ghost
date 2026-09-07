import {lazySingleton} from './lazy-singleton';

type Awaitable<T> = T | PromiseLike<T>;

export interface ServiceLifecycleOptions<T extends object, Args extends unknown[]> {
    name: string;
    create(...args: Args): Awaitable<T>;
    stableInstance?: T;
    reinitialize?: boolean;
    start?(service: T): Awaitable<void>;
    stop?(service: T): Awaitable<void>;
}

export interface ServiceLifecycle<T extends object, Args extends unknown[]> {
    service: T;
    init(...args: Args): Awaitable<void>;
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
    stableInstance,
    reinitialize = false,
    start,
    stop
}: ServiceLifecycleOptions<T, Args>): ServiceLifecycle<T, Args> {
    let instance: T | undefined = stableInstance;
    let initPromise: Promise<void> | undefined;
    let shutdownPromise: Promise<void> | undefined;

    const service = lazySingleton(name, () => instance);

    const isPromiseLike = <Value>(value: Awaitable<Value>): value is PromiseLike<Value> => {
        return typeof (value as PromiseLike<Value>)?.then === 'function';
    };

    const cleanUpFailedStart = (candidate: T, startError: unknown): Awaitable<never> => {
        if (!stop) {
            throw startError;
        }

        try {
            const cleanup = stop(candidate);

            if (isPromiseLike(cleanup)) {
                return Promise.resolve(cleanup).then(
                    () => Promise.reject(startError),
                    stopError => Promise.reject(new ServiceLifecycleFailure(`${name} failed to start and clean up`, [
                        startError,
                        stopError
                    ]))
                );
            }
        } catch (stopError) {
            throw new ServiceLifecycleFailure(`${name} failed to start and clean up`, [
                startError,
                stopError
            ]);
        }

        throw startError;
    };

    const startCandidate = (candidate: T): Awaitable<void> => {
        try {
            const startup = start?.(candidate);

            if (startup && isPromiseLike(startup)) {
                return Promise.resolve(startup).then(
                    () => {
                        instance = candidate;
                    },
                    startError => cleanUpFailedStart(candidate, startError)
                );
            }

            instance = candidate;
        } catch (startError) {
            return cleanUpFailedStart(candidate, startError);
        }
    };

    const trackInit = (operation: PromiseLike<void>): Promise<void> => {
        const tracked = Promise.resolve(operation).finally(() => {
            if (initPromise === tracked) {
                initPromise = undefined;
            }
        });
        initPromise = tracked;
        return tracked;
    };

    const init = (...args: Args): Awaitable<void> => {
        if (instance && !reinitialize) {
            return;
        }

        if (initPromise) {
            return initPromise;
        }

        if (shutdownPromise) {
            return shutdownPromise.then(() => init(...args));
        }

        let candidate: Awaitable<T>;

        try {
            candidate = create(...args);
        } catch (error) {
            throw error;
        }

        if (isPromiseLike(candidate)) {
            return trackInit(Promise.resolve(candidate).then(startCandidate));
        }

        const startup = startCandidate(candidate);
        if (startup && isPromiseLike(startup)) {
            return trackInit(startup);
        }

        return;
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
            instance = stableInstance;

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
