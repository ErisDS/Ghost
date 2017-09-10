var debug = require('ghost-ignition').debug('spike:app');
var express = require('express');
var pubRouter = require('./routes');

module.exports = function setupPublication() {
    debug('Publication setup start');

    var app = express();

    // Static asset handling

    // Common middleware

    // Routing
    app.use(pubRouter());

    // Error handling

    debug('Publication setup end');

    return app;
};
