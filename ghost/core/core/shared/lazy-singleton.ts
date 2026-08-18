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

            // Own functions are collaborators stored on a composite facade and
            // do not need a receiver (preserving their identity also keeps
            // normal stubbing semantics). Prototype methods belong to class
            // instances and must retain their receiver, including private fields.
            return typeof value === 'function' && !Object.prototype.hasOwnProperty.call(instance, property)
                ? value.bind(instance)
                : value;
        },
        set(_target, property, value) {
            return Reflect.set(resolve(), property, value);
        },
        has(_target, property) {
            return Reflect.has(resolve(), property);
        },
        defineProperty(_target, property, attributes) {
            return Reflect.defineProperty(resolve(), property, attributes);
        },
        deleteProperty(_target, property) {
            return Reflect.deleteProperty(resolve(), property);
        },
        getOwnPropertyDescriptor(_target, property) {
            const descriptor = Reflect.getOwnPropertyDescriptor(resolve(), property);

            return descriptor ? {...descriptor, configurable: true} : undefined;
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(resolve());
        }
    });
}
