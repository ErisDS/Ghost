import PostScheduling from './post-scheduling';
import {lazySingleton} from '../../../shared/lazy-singleton';

let instance: PostScheduling | undefined;

export const service = lazySingleton('PostScheduling', () => instance);

export function init(): void {
    if (instance) {
        return;
    }

    const {service: internalKeys} = require('../internal-keys');
    const {service: adapterManager} = require('../adapter-manager');
    const {withErrorCapture} = require('../../adapters/scheduling/error-capture');
    const urlUtils = require('../../../shared/url-utils').default;

    instance = new PostScheduling({
        apiUrl: urlUtils.urlFor('api', {type: 'admin'}, true),
        adapter: withErrorCapture(adapterManager.getAdapter('scheduling')),
        internalKeys
    });
}
