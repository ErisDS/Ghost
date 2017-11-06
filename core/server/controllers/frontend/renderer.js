var debug = require('ghost-ignition').debug('renderer'),
    templates = require('./templates');

module.exports = function renderer(req, res) {
    // Template
    // @TODO: this is looking more and more like a middleware stack, finish refactoring!
    templates.setTemplate(req, res);

    // Final checks, filters, etc...
    // Should happen here, after everything is set, as the last thing before we actually render
    // @TODO figure out how to add proper hooks / filters here

    // Render Call
    debug('Rendering template: ' + res.locals.template + ' for: ' + req.originalUrl);
    debug('res.locals', res.locals);
    res.render(res.locals.template, res.data);
};
