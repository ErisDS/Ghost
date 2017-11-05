var path                = require('path'),
    express             = require('express'),
    middleware          = require('./middleware'),
    bodyParser          = require('body-parser'),
    templates           = require('../../../controllers/frontend/templates'),
    setResponseContext  = require('../../../controllers/frontend/context'),
    brute               = require('../../../middleware/brute'),

    templateName = 'private',
    defaultTemplate = path.resolve(__dirname, 'views', templateName + '.hbs'),

    privateRouter = express.Router();

function _renderer(req, res) {
    // Renderer begin
    // Format data
    var data = {};

    if (res.error) {
        data.error = res.error;
    }

    // Context
    setResponseContext(req, res);

    // Template
    res.locals.template = templates.pickTemplate(templateName, defaultTemplate);

    // Final checks, filters, etc...
    // Should happen here, after everything is set, as the last thing before we actually render

    // Render Call
    return res.render(res.locals.template, data);
}

// password-protected frontend route
privateRouter.route('/')
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
