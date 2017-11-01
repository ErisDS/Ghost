var _ = require('lodash'),
    api = require('../../api'),
    urlUtils  = require('../../utils').url,
    prefetchDefaults = {
        context: {
            internal: true
        },
        limit: 'all'
    };

class Resource {
    constructor(config) {
        this.name = config.name;
        this.api = config.api;
        this.prefetchOptions = config.prefetchOptions || {};
        this.urlLookup = config.urlLookup || config.name;
        this.items = {};
    }

    prefetch() {
        const options = _.defaults(this.prefetchOptions, prefetchDefaults);

        return api[this.api]
            .browse(options)
            .then((resp) => {
                this.items = resp[this.api];
                return this.items;
            });
    }

    toUrl(resource) {
        const data = {
            [this.urlLookup]: resource
        };
        return urlUtils.urlFor(this.urlLookup, data);
    }
}

module.exports = Resource;
