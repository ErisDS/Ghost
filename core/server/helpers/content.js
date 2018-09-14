// # Content Helper
// Usage: `{{content}}`, `{{content words="20"}}`, `{{content characters="256"}}`
//
// Turns content html into a safestring so that the user doesn't have to
// escape it or tell handlebars to leave it alone with a triple-brace.
//
// Enables tag-safe truncation of content by characters or words.

var proxy = require('./proxy'),
    _ = require('lodash'),
    downsize = require('downsize'),
    cheerio = require('cheerio'),
    SafeString = proxy.SafeString;

module.exports = function content(path, options) {
    if (!options) {
        options = path || {};
        path = undefined;
    }

    var contentOptions = (options || {}).hash || {};
    var truncateOptions = _.pick(contentOptions, ['words', 'characters']);
    var output;

    _.keys(truncateOptions).map(function (key) {
        truncateOptions[key] = parseInt(truncateOptions[key], 10);
    });

    if (truncateOptions.hasOwnProperty('words') || truncateOptions.hasOwnProperty('characters')) {
        return new SafeString(
            downsize(this.html, truncateOptions)
        );
    }

    if (!path) {
        output = this.html;
    } else {
        var $ = cheerio.load(this.html);
        console.log('p', $(path).first());
        console.log('p2', $(path).first().text());
        console.log('p3', $(path).first().attr('href'));

        output = $(path).first().attr('href');
    }

    return new SafeString(output);
};
