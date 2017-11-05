var debug = require('ghost-ignition').debug('renderer');

module.exports = function renderer(req, res) {
    // Render Call
    debug('Rendering template: ' + res.locals.template + ' for: ' + req.originalUrl);
    debug('res.locals', res.locals);
    res.render(res.locals.template, res.data);
};
