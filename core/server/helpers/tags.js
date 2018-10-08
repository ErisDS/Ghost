// # Tags Helper
// Usage: `{{tags}}`, `{{tags separator=' - '}}`
//
// Returns a string of the tags on the post.
// By default, tags are separated by commas.
//
// Note that the standard {{#each tags}} implementation is unaffected by this helper
const proxy = require('./proxy'),
    _ = require('lodash'),
    tagsHelper = require('@tryghost/helpers/tags'),
    urlService = proxy.urlService,
    SafeString = proxy.SafeString,
    templates = proxy.templates;

module.exports = function tags(options = {}) {
    options.hash = options.hash || {};

    let opts = _.pick(options.hash, ['separator', 'prefix', 'suffix', 'limit', 'from', 'to', 'visibility']);
    let autolink = !(_.isString(options.hash.autolink) && options.hash.autolink === 'false');

    opts.fn = function processTag(tag) {
        return autolink ? templates.link({
            url: urlService.getUrlByResourceId(tag.id, {withSubdirectory: true}),
            text: _.escape(tag.name)
        }) : _.escape(tag.name);
    };

    let output = tagsHelper(this, opts);

    return new SafeString(output);
};
