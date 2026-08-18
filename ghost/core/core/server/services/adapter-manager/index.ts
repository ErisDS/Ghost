import {AdapterManager} from './adapter-manager';
import {adapterPaths} from './adapter-paths';
import {baseClasses} from './base-classes';
import {lazySingleton} from '../../../shared/lazy-singleton';

let instance: AdapterManager | undefined;

export const service = lazySingleton('AdapterManager', () => instance);

export function init(): void {
    if (instance) {
        return;
    }

    const config = require('../../../shared/config');

    instance = new AdapterManager({
        loadAdapterFromPath: require,
        config,
        pathsToAdapters: adapterPaths,
        baseClasses
    });

    instance.init();
}
