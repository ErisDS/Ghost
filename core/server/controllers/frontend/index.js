/**
 * Main controller for Ghost frontend
 */

/*global require, module */

var debug = require('ghost-ignition').debug('channels:single'),
    api = require('../../api'),
    utils = require('../../utils'),
    filters = require('../../filters'),
    templates = require('./templates'),
    handleError = require('./error'),

    postLookup = require('./post-lookup'),

    setRequestIsSecure = require('./secure'),

    frontendControllers;



frontendControllers = {
    preview: function preview(req, res, next) {
        var params = {
                uuid: req.params.uuid,
                status: 'all',
                include: 'author,tags'
            };

        api.posts.read(params).then(function then(result) {
            var post = result.posts[0];

            if (!post) {
                return next();
            }

            if (req.params.options && req.params.options.toLowerCase() === 'edit') {
                // CASE: last param is of url is /edit, redirect to admin
                return res.redirect(utils.url.urlJoin(utils.url.urlFor('admin'), 'editor', post.id, '/'));
            } else if (req.params.options) {
                // CASE: unknown options param detected. Ignore and end in 404.
                return next();
            }

            if (post.status === 'published') {
                return res.redirect(301, utils.url.urlFor('post', {post: post}));
            }

            setRequestIsSecure(req, post);

            filters.doFilter('prePostsRender', post, res.locals)
                .then(renderPost(req, res));
        }).catch(handleError(next));
    },
    single: function single(req, res, next) {
        // Query database to find post
        return postLookup(req.path).then(function then(lookup) {
            var post = lookup ? lookup.post : false;

            if (!post) {
                return next();
            }

            // CASE: postlookup can detect options for example /edit, unknown options get ignored and end in 404
            if (lookup.isUnknownOption) {
                return next();
            }

            // CASE: last param is of url is /edit, redirect to admin
            if (lookup.isEditURL) {
                return res.redirect(utils.url.urlJoin(utils.url.urlFor('admin'), 'editor', post.id, '/'));
            }

            // CASE: permalink is not valid anymore, we redirect him permanently to the correct one
            if (post.url !== req.path) {
                return res.redirect(301, post.url);
            }

            setRequestIsSecure(req, post);

            filters.doFilter('prePostsRender', post, res.locals)
                .then(renderPost(req, res));
        }).catch(handleError(next));
    }
};

module.exports = frontendControllers;
