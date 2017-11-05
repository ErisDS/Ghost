var debug = require('ghost-ignition').debug('channels:render'),
    formatResponse = require('./format-response'),
    setResponseContext = require('./context'),
    templates = require('./templates');

module.exports = function renderChannel(req, res) {
    debug('renderChannel called');
    return function renderChannel(result) {
        // Renderer begin
        // Format data 2
        // Do final data formatting and then render
        result = formatResponse.channel(result);

        // Context
        setResponseContext(req, res);

        // Template
        res.locals.template = templates.channel(res.locals.channel);

        // Final checks, filters, etc...
        // Should happen here, after everything is set, as the last thing before we actually render
        // @TODO move any sort of filter here - currently happens above

        // Render Call
        debug('Rendering view: ' + res.locals.template);
        res.render(res.locals.template, result);
    };
};
