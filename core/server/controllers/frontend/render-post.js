var debug = require('ghost-ignition').debug('channels:render-post'),
    templates = require('./templates'),
    formatResponse = require('./format-response'),
    renderer = require('./renderer'),
    setResponseContext = require('./context');
/*
 * Sets the response context around a post and renders it
 * with the current theme's post view. Used by post preview
 * and single post methods.
 * Returns a function that takes the post to be rendered.
 */

module.exports = function renderPost(req, res) {
    debug('renderPost called');
    return function renderPost(post) {
        // Renderer begin
        // Format data 2 - 1 is in preview/single
        res.data = formatResponse.single(post);

        // Context
        setResponseContext(req, res);

        // Template
        // @TODO make a function that can do the different template calls
        res.locals.template = templates.single(post);

        // Final checks, filters, etc...
        // Should happen here, after everything is set, as the last thing before we actually render
        // @TODO move any sort of filter here - currently happens elsewhere
        // Should happen here, after everything is set, as the last thing before we actually render

        // Render Call
        return renderer(req, res);
    };
};
