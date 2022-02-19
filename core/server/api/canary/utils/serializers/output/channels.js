const debug = require('@tryghost/debug')('api:canary:utils:serializers:output:channels');

module.exports = {
    all(models, apiConfig, frame) {
        debug('all');

        if (!models) {
            return;
        }

        if (models.meta) {
            frame.response = {
                channels: models.data,
                meta: models.meta
            };

            return;
        }

        frame.response = {
            channels: [models]
        };
    }
};
