/**
 * Entry
 *
 * An entry is a post or page, a single piece of content.
 */
var entryService = module.exports;

var debug = require('ghost-ignition').debug('services:entry');
var _ = require('lodash');
var url = require('url');
var path = require('path');
var routeMatch = require('path-match')();

// Outside world
var settingsCache = require('../../settings/cache');
var postsAPI = require('../../api').posts;
var entryMW = require('../middleware');

var editParam = ':edit?';
var includeParam = 'author,tags';

var postRoute = path.join(settingsCache.get('permalinks'), editParam);
var pageRoute = path.join('/:slug/', editParam);

entryService.urlToQuery = function entryUrlToQuery(entryUrl) {
    var matchUrl = url.parse(entryUrl).path;
    var postMatchFn = routeMatch(postRoute);
    var pageMatchFn = routeMatch(pageRoute);
    var params = postMatchFn(matchUrl) || pageMatchFn(matchUrl);

    if (!params) {
        return {};
    }

    if (params.edit && params.edit === 'edit') {
        params.edit = true;
    } else {
        delete params.edit;
    }

    return params;
};

entryService.format = function entryFormat(result) {
    return {post: result.posts[0]};
};

entryService.lookup = function entryLookup(params) {
    params = _.pick(params.query, 'slug', 'id');
    params.include = includeParam;

    debug('params', params);

    return postsAPI
        .read(params)
        .then(function (result) {
            return result;
        });
};

entryService.middleware = function entryMiddleware() {
    return [
        entryMW.fetchEntry,
        entryMW.setContext,
        entryMW.renderEntry
    ];
};

