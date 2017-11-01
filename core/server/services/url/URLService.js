'use strict';

/**
 * # URL Service
 *
 * This file defines a class of URLService, which serves as a centralised place to handle
 * generating, storing & fetching URLs of all kinds.
 */

var _ = require('lodash'),
    Promise = require('bluebird'),
    _debug = require('ghost-ignition').debug._base,
    debug = _debug('ghost:url-service'),
    // TODO: load this from a routing service, so it is dynamic
    resourceConfig = require('./config.json'),
    Resource = require('./Resource'),
    urlCache = require('./url-cache'),
    urlUtils  = require('../../utils').url;

class UrlService {
    constructor() {
        this.resources = [];

        _.each(resourceConfig, (config) => {
            this.resources.push(new Resource(config));
        });
    }

    prefetch () {
        return Promise.each(this.resources, (resource) => {
            return resource.prefetch();
        });
    }

    loadResourceUrls() {
        debug('load start');

        this.prefetch()
            .then(() => {
                debug('load end, start processing');

                _.each(this.resources, (resource) => {
                    _.each(resource.items, function (item) {
                        var url = resource.toUrl(item),
                            data = {
                                slug: item.slug,
                                resource: {
                                    type: resource.name,
                                    id: item.id
                                }
                            };

                        urlCache.set(url, data);
                    });
                });

                debug('processing done, url cache built', _.size(urlCache.getAll()));
                // Wrap this in a check, because else this is a HUGE amount of output
                // To output this, use DEBUG=ghost:*,ghost-url
                if (_debug.enabled('ghost-url')) {
                    debug('url-cache', require('util').inspect(urlCache.getAll(), false, null));
                }
            })
            .catch((err) => {
                debug('load error', err);
            });
    }

    // @TODO: reconsider naming
    addStatic(relativeUrl, data) {
        const url = urlUtils.urlFor({relativeUrl: relativeUrl});
        data['static'] = true;
        urlCache.set(url, data);
    }
}

module.exports = UrlService;
