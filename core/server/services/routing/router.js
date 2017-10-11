var debug = require('ghost-ignition').debug('routing:router');
var blogRouter = require('express').Router();
var Route = require('./Route');
var events = require('../../events');
var _private = {};

_private.mountRoute = function (route) {
    debug('registerRoute', route);

    route.mount(blogRouter);
};

module.exports = function router() {
    events.emit('router:ready');

    // Demonstrate that we can add routes AFTER the router is mounted
    events.on('server:start', function registerRoute() {
        _private.mountRoute(new Route({path: '/test/'}));
    });

    return blogRouter;
};
