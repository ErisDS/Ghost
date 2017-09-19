// Channels
// Entries
var debug = require('ghost-ignition').debug('spike:router');
var _ = require('lodash');
var express = require('express');

// Outside world
var settingsCache = require('../../settings/cache');
var entryService = require('./entry');


var routeTypes = ['entry', 'channel'];
var routeCache = {
    entry: {},
    channel: {}
};

function registerRoute(type, route, config) {
    if (_.includes(routeTypes, type) && !routeCache[type][route]) {
        debug(registerRoute, type, route, config);
        routeCache[type][route] = config;
    }
}

module.exports.registerEntry = function registerEntry(route, config) {
    return registerRoute('entry', route, config);
};

// Entry = post or page
module.exports.entryRouter = function entryRouter() {
    debug('entryRouter', routeCache.entry);
    debug('post permalinks', settingsCache.get('permalinks'));


    var router = express.Router({mergeParams: true});

    // _.each(routeCache.entry, function entryHandler(entryConfig, route) {
    //     // @TODO: register URL in url-registry
    //     router.get(route, function setEntryConfig(req, res, next) {
    //         // TODO: some sort of validation here?
    //         res.locals.entry = entryConfig;
    //         next();
    //     }, handler.entry())
    // });

    // Fallback route for automatic entry rendering
    router.get('*', entryService.middleware());

    return router;
};

module.exports.channelRouter = function channelRouter() {
    var router = express.Router({mergeParams: true});

    return router;
};

module.exports.specialRouter = function specialRouter() {
    var router = express.Router({mergeParams: true});

    return router;
};

module.exports.appRouter = function appRouter(hookName) {
    var router = express.Router({mergeParams: true});

    return router;
};
