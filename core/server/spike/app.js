var debug = require('ghost-ignition').debug('spike:app');
var express = require('express');
var pubRouter = require('./routes');
// Theme interface
var themeService = require('./services/theme');
var staticTheme = require('../middleware/static-theme');
var serveFavicon = require('../middleware/serve-favicon');
var servePublicFile = require('../middleware/serve-public-file');
var storage = require('../adapters/storage');
var utils = require('../utils');

module.exports = function setupPublication() {
    debug('Publication setup start');

    var blogApp = express();

    // ## App - specific code
    // set the view engine
    blogApp.set('view engine', 'hbs');

    // Static content/assets
    // @TODO make sure all of these have a local 404 error handler
    // Favicon
    blogApp.use(serveFavicon());
    // /public/ghost-sdk.js
    blogApp.use(servePublicFile('public/ghost-sdk.js', 'application/javascript', utils.ONE_HOUR_S));
    blogApp.use(servePublicFile('public/ghost-sdk.min.js', 'application/javascript', utils.ONE_HOUR_S));
    // Serve sitemap.xsl file
    blogApp.use(servePublicFile('sitemap.xsl', 'text/xsl', utils.ONE_DAY_S));

    // Serve stylesheets for default templates
    blogApp.use(servePublicFile('public/ghost.css', 'text/css', utils.ONE_HOUR_S));
    blogApp.use(servePublicFile('public/ghost.min.css', 'text/css', utils.ONE_HOUR_S));

    // Serve images for default templates
    blogApp.use(servePublicFile('public/404-ghost@2x.png', 'png', utils.ONE_HOUR_S));
    blogApp.use(servePublicFile('public/404-ghost.png', 'png', utils.ONE_HOUR_S));

    // Static asset handling
    // Serve blog images using the storage adapter
    blogApp.use('/' + utils.url.STATIC_IMAGE_URL_PREFIX, storage.getStorage().serve());

    // Theme static assets/files
    blogApp.use(staticTheme());
    debug('Static content done');

    // Common middleware

    // Theme middleware
    // This should happen AFTER any shared assets are served, as it only changes things to do with templates
    // At this point the active theme object is already updated, so we have the right path, so it can probably
    // go after staticTheme() as well, however I would really like to simplify this and be certain
    blogApp.use(themeService.middleware);

    // Routing
    blogApp.use(pubRouter());

    // Error handling
    blogApp.use(themeService.errorHandler);

    debug('Publication setup end');

    return blogApp;
};
