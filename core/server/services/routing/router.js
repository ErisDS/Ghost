var debug = require('ghost-ignition').debug('routing:router');
var Router = require('express').Router;
var Route = require('./Route');
var events = require('../../events');
// Don't know what to call this yet - they are controllers / middleware stacks / routers ??
var magic = require('../magic');
var _private = {};

// Inner Router contains our actual routes, it is dynamic and can be added to after server load
var innerRouter = new Router({mergeParams: true});
// Outer Router contains our before and after middleware, and the Inner Router is mounted between them
var outerRouter = new Router();

// This is a helper function to mount a new route on the inner router
_private.mountRoute = function mountRoute(route) {
    debug('registerRoute', route);

    route.mount(innerRouter);
};

module.exports = function router() {
    events.emit('router:ready');

    outerRouter.use(function initConfig(req, res, next) {
        res.locals = res.locals || {};
        res.locals.config = res.locals.config || {};
        next();
    });

    outerRouter.use(innerRouter);

    outerRouter.use(function renderer(req, res) {
        debug('rendering');
        return res.json(res.locals);
    });

    _private.mountRoute(new Route({path: '/', name: 'home', controller: magic.channelMagic()}));


    // Demonstrate that we can add routes AFTER the router is mounted, but only
    // but only if the wildcard route is still registered last
    events.on('server:start', function registerRoute() {
        _private.mountRoute(new Route({path: '/test/'}));

        _private.mountRoute(new Route({path: '*', name: 'entry', controller: magic.entryMagic()}));
    });


    return outerRouter;
};
