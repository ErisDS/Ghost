import {InternalServerError} from '@tryghost/errors';

/**
 * Exposes a stable facade for a service that is constructed during boot.
 *
 * The facade resolves the current service instance for every property access,
 * allowing require-shaped consumers to import it before the service is
 * initialized without exposing an optional value.
 */
export function lazySingleton<T extends object>(name: string, getInstance: () => T | undefined): T {
    const resolve = (): T => {
        const instance = getInstance();

        if (!instance) {
            throw new InternalServerError({
                message: `${name} must be initialized before use`
            });
        }

        return instance;
    };

    return new Proxy({} as T, {
        get(_target, property) {
            const instance = resolve();
            const value = Reflect.get(instance, property, instance);

            return typeof value === 'function' ? value.bind(instance) : value;
        },
        set(_target, property, value) {
            return Reflect.set(resolve(), property, value);
        }
    });
}
