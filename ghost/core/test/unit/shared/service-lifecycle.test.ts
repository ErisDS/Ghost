import {describe, expect, it, vi} from 'vitest';
import {defineService} from '../../../core/shared/service-lifecycle';

class ExampleService {
    value: number;

    constructor(value: number) {
        this.value = value;
    }
}

describe('defineService', function () {
    it('does not expose a service before initialization', function () {
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => new ExampleService(1)
        });

        expect(() => lifecycle.service.value).toThrow('ExampleService must be initialized before use');
    });

    it('preserves synchronous initialization for synchronous services', function () {
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => new ExampleService(1)
        });

        expect(lifecycle.init()).toBeUndefined();
        expect(lifecycle.service.value).toBe(1);
    });

    it('publishes a service after startup completes', async function () {
        let finishStart!: () => void;
        const startBarrier = new Promise<void>((resolve) => {
            finishStart = resolve;
        });
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => new ExampleService(1),
            start: () => startBarrier
        });

        const initializing = lifecycle.init();

        expect(() => lifecycle.service.value).toThrow('ExampleService must be initialized before use');

        finishStart();
        await initializing;

        expect(lifecycle.service.value).toBe(1);
    });

    it('shares concurrent initialization', async function () {
        const create = vi.fn(() => new ExampleService(1));
        const start = vi.fn(async () => {});
        const lifecycle = defineService({name: 'ExampleService', create, start});

        const first = lifecycle.init();
        const second = lifecycle.init();

        expect(first).toBe(second);
        await Promise.all([first, second]);
        await lifecycle.init();

        expect(create).toHaveBeenCalledOnce();
        expect(start).toHaveBeenCalledOnce();
    });

    it('can reinitialize a stable facade on each boot', async function () {
        const create = vi.fn(() => new ExampleService(1));
        const lifecycle = defineService({
            name: 'ExampleService',
            create,
            reinitialize: true
        });

        lifecycle.init();
        lifecycle.init();

        expect(create).toHaveBeenCalledTimes(2);
        expect(lifecycle.service.value).toBe(1);
    });

    it('keeps an explicitly stable legacy instance available around boot', async function () {
        const instance = new ExampleService(1);
        const create = vi.fn(() => instance);
        const lifecycle = defineService({
            name: 'ExampleService',
            create,
            stableInstance: instance,
            reinitialize: true
        });

        expect(lifecycle.service.value).toBe(1);

        await lifecycle.init();
        await lifecycle.shutdown();

        expect(lifecycle.service.value).toBe(1);

        await lifecycle.init();
        expect(create).toHaveBeenCalledTimes(2);
    });

    it('passes initialization arguments to the factory', async function () {
        const lifecycle = defineService<ExampleService, [number]>({
            name: 'ExampleService',
            create: value => new ExampleService(value)
        });

        await lifecycle.init(42);

        expect(lifecycle.service.value).toBe(42);
    });

    it('cleans up a failed start without publishing the candidate', async function () {
        const candidate = new ExampleService(1);
        const failure = new Error('start failed');
        const stop = vi.fn(async () => {});
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => candidate,
            start: async () => {
                throw failure;
            },
            stop
        });

        await expect(lifecycle.init()).rejects.toBe(failure);

        expect(stop).toHaveBeenCalledWith(candidate);
        expect(() => lifecycle.service.value).toThrow('ExampleService must be initialized before use');
    });

    it('reports both startup and cleanup failures', async function () {
        const startFailure = new Error('start failed');
        const stopFailure = new Error('stop failed');
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => new ExampleService(1),
            start: async () => {
                throw startFailure;
            },
            stop: async () => {
                throw stopFailure;
            }
        });

        await expect(lifecycle.init()).rejects.toMatchObject({
            errors: [startFailure, stopFailure],
            message: 'ExampleService failed to start and clean up'
        });
    });

    it('makes the facade unavailable before awaiting shutdown', async function () {
        let finishStop!: () => void;
        const stopBarrier = new Promise<void>((resolve) => {
            finishStop = resolve;
        });
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => new ExampleService(1),
            stop: () => stopBarrier
        });
        await lifecycle.init();

        const stopping = lifecycle.shutdown();

        expect(() => lifecycle.service.value).toThrow('ExampleService must be initialized before use');

        finishStop();
        await stopping;
    });

    it('shares concurrent shutdown and stops once', async function () {
        const stop = vi.fn(async () => {});
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => new ExampleService(1),
            stop
        });
        await lifecycle.init();

        const first = lifecycle.shutdown();
        const second = lifecycle.shutdown();

        expect(first).toBe(second);
        await Promise.all([first, second]);
        await lifecycle.shutdown();

        expect(stop).toHaveBeenCalledOnce();
    });

    it('waits for initialization before shutting down', async function () {
        let finishStart!: () => void;
        const startBarrier = new Promise<void>((resolve) => {
            finishStart = resolve;
        });
        const stop = vi.fn(async () => {});
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => new ExampleService(1),
            start: () => startBarrier,
            stop
        });

        const initializing = lifecycle.init();
        const stopping = lifecycle.shutdown();
        finishStart();

        await Promise.all([initializing, stopping]);

        expect(stop).toHaveBeenCalledOnce();
        expect(() => lifecycle.service.value).toThrow('ExampleService must be initialized before use');
    });

    it('creates a fresh implementation after shutdown', async function () {
        let value = 0;
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => {
                value += 1;
                return new ExampleService(value);
            }
        });

        await lifecycle.init();
        expect(lifecycle.service.value).toBe(1);

        await lifecycle.shutdown();
        await lifecycle.init();

        expect(lifecycle.service.value).toBe(2);
    });

    it('waits for shutdown before initializing again', async function () {
        let finishStop!: () => void;
        const stopBarrier = new Promise<void>((resolve) => {
            finishStop = resolve;
        });
        let value = 0;
        const lifecycle = defineService({
            name: 'ExampleService',
            create: () => {
                value += 1;
                return new ExampleService(value);
            },
            stop: () => stopBarrier
        });
        await lifecycle.init();

        const stopping = lifecycle.shutdown();
        const initializing = lifecycle.init();

        expect(() => lifecycle.service.value).toThrow('ExampleService must be initialized before use');

        finishStop();
        await Promise.all([stopping, initializing]);

        expect(lifecycle.service.value).toBe(2);
    });
});
