import {AdapterManager} from './adapter-manager';
import {adapterPaths} from './adapter-paths';
import {baseClasses} from './base-classes';
import {defineService} from '../../../shared/service-lifecycle';

let instance: AdapterManager | undefined;

function create() {
    if (instance) {
        return instance;
    }

    const config = require('../../../shared/config');

    instance = new AdapterManager({
        loadAdapterFromPath: require,
        config,
        pathsToAdapters: adapterPaths,
        baseClasses
    });

    instance.init();

    return instance;
}
const lifecycle = defineService({
    name: 'AdapterManager',
    create
});

export const service = lifecycle.service;
export const init = lifecycle.init;
export const shutdown = lifecycle.shutdown;
