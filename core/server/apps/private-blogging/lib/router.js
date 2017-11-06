var path                = require('path'),
    express             = require('express'),
    middleware          = require('./middleware'),
    bodyParser          = require('body-parser'),
    setResponseContext  = require('../../../controllers/frontend/context'),
    renderer            = require('../../../controllers/frontend/renderer'),
    brute               = require('../../../middleware/brute'),

    templateName = 'private',
    // @TODO: DRY this up
    routeConfig = {
        type: 'custom',
        templateName: templateName,
        defaultTemplate: path.resolve(__dirname, 'views', templateName + '.hbs')
    },

    privateRouter = express.Router();

function configMiddleware(req, res, next) {
    // Note: this is super similar to the config middleware used in channels
    // @TODO refactor into to something explicit
    res.locals.route = routeConfig;
    next();
}

function _renderer(req, res) {
    // Renderer begin
    // Format data
    res.data = {};

    if (res.error) {
        res.data.error = res.error;
    }

    // Context
    setResponseContext(req, res);

    // Render Call
    return renderer(req, res);
}

// password-protected frontend route
privateRouter
    .use(configMiddleware)
    .route('/')
    .get(
        middleware.isPrivateSessionAuth,
        _renderer
    )
    .post(
        bodyParser.urlencoded({extended: true}),
        middleware.isPrivateSessionAuth,
        brute.privateBlog,
        middleware.authenticateProtection,
        _renderer
    );

module.exports = privateRouter;
module.exports.renderer = _renderer;
