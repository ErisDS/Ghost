const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

// Composition root for the webhook dispatch pipeline: builds the
// serialize → payload → trigger chain and registers the model-event
// listeners. Requires are deferred until init() runs so the model layer
// isn't loaded before boot wires it.
function init() {
    if (!instance) {
        const models = require('../../models');
        const limitService = require('../../services/limits');
        const events = require('../../lib/common/events');
        const urlService = require('../url').service;
        const createSerialize = require('./serialize');
        const createPayload = require('./payload');
        const WebhookTrigger = require('./webhook-trigger');
        const registerListeners = require('./listen');

        const serialize = createSerialize({urlService});
        const payload = createPayload({serialize});
        const trigger = new WebhookTrigger({models, payload, limitService});

        registerListeners({events, trigger});
        instance = {serialize, payload, trigger};
    }
}

const service = lazySingleton('WebhooksService', () => instance);

module.exports = {init, service};
