var utils = require('../utils'),
    filters = require('../filters'),
    tempUrlService = require('../services/temp'),
    EntryController = require('./base/EntryController'),
    handleError = require('./frontend/error'),
    formatResponse = require('./frontend/format-response'),
    setRequestIsSecure = require('./frontend/secure'),
    singleController = new EntryController({
        name: 'preview'
    });

singleController.main = function singleController(req, res, next) {
    console.log('controller');
    // Query database to find post
    return tempUrlService.lookupEntry(req.path).then(function then(lookup) {
        console.log('controller part 2');
        // Format data 1
        var post = lookup ? lookup.post : false;

        if (!post) {
            console.log('next 1');
            return next();
        }

        // CASE: postlookup can detect options for example /edit, unknown options get ignored and end in 404
        if (lookup.isUnknownOption) {
            console.log('next 2');
            return next();
        }

        // CASE: last param is of url is /edit, redirect to admin
        if (lookup.isEditURL) {
            return utils.url.redirectToAdmin(302, res, '#/editor/' + post.id);
        }

        // CASE: permalink is not valid anymore, we redirect him permanently to the correct one
        if (post.url !== req.path) {
            return utils.url.redirect301(res, post.url);
        }

        setRequestIsSecure(req, post);

        console.log('pre filter');
        // @TODO clean this duplicate code up
        filters.doFilter('prePostsRender', post, res.locals)
            .then(function formatResult(post) {
                console.log('post after filter', post);
                // Format data 2
                res.data = formatResponse.single(post);

                //return next();
            });
    }).catch(handleError(next));
};

module.exports = singleController;
