import PostScheduling from './post-scheduling';
import {defineService} from '../../../shared/service-lifecycle';

let instance: PostScheduling | undefined;

function create() {
    if (instance) {
        return instance;
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

    return instance;
}
const lifecycle = defineService({
    name: 'PostScheduling',
    create
});

export const service = lifecycle.service;
export const init = lifecycle.init;
export const shutdown = lifecycle.shutdown;
