var debug = require('ghost-ignition').debug('renderer'),
    setContext = require('./context'),
    templates = require('./templates');

module.exports = function renderer(req, res, next) {
    console.log('RENDERER', res.locals);

    // Context
    setContext(req, res);

    // Template
    templates.setTemplate(req, res);

    // Final checks, filters, etc...
    // Should happen here, after everything is set, as the last thing before we actually render
    // @TODO figure out how to add proper hooks / filters here
    if (!res.data || !res.locals.template) {
        return next();
    }

    // Render Call
    debug('Rendering template: ' + res.locals.template + ' for: ' + req.originalUrl);
    debug('res.locals', res.locals);
    res.render(res.locals.template, res.data);
};
