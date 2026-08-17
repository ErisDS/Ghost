import {describe, expect, it} from 'vitest';
import {lazySingleton} from '../../../core/shared/lazy-singleton';

describe('lazySingleton', function () {
    it('returns a stable facade', function () {
        const facade = lazySingleton('ExampleService', () => ({value: 1}));

        expect(facade).toBe(facade);
    });

    it('throws an actionable internal error when read before initialization', function () {
        const facade = lazySingleton<{value: number}>('ExampleService', () => undefined);

        expect(() => facade.value).toThrow('ExampleService must be initialized before use');
    });

    it('forwards property reads and writes to the current instance', function () {
        let instance = {value: 1};
        const facade = lazySingleton('ExampleService', () => instance);

        expect(facade.value).toBe(1);

        facade.value = 2;
        expect(instance.value).toBe(2);

        instance = {value: 3};
        expect(facade.value).toBe(3);
    });

    it('preserves method binding when a method is extracted', function () {
        class ExampleService {
            value = 1;

            increment() {
                this.value += 1;
                return this.value;
            }
        }

        const instance = new ExampleService();
        const facade = lazySingleton('ExampleService', () => instance);

        const increment = facade.increment;

        expect(increment()).toBe(2);
        expect(instance.value).toBe(2);
        expect(facade).toBeInstanceOf(ExampleService);
    });

    it('forwards null values returned by an initialized service', function () {
        const facade = lazySingleton('ExampleService', () => ({value: null as null | string}));

        expect(facade.value).toBeNull();
    });
});
