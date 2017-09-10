var express = require('express');
var routerService = require('./services/router');

module.exports = function pubRouter() {
    var router = express.Router();

    // Special routes, e.g. signin, signup, preview
    router.use(routerService.specialRouter());

    // App routes 1
    router.use(routerService.appRouter('channels:before'));

    // Channels
    router.use(routerService.channelRouter());

    // App routes 2, 3
    router.use(routerService.appRouter('channels:after'));
    router.use(routerService.appRouter('entries:before'));

    // Entries
    router.use(routerService.entryRouter());

    // App routes 4
    router.use(routerService.appRouter('entries:after'));

    return router;
};
