var api = require('../api'),
    utils = require('../utils'),
    filters = require('../filters'),
    EntryController = require('./base/EntryController'),
    handleError = require('./frontend/error'),
    formatResponse = require('./frontend/format-response'),
    setRequestIsSecure = require('./frontend/secure'),
    previewController = new EntryController({
        name: 'preview'
    });

previewController.main = function fetchPost(req, res, next) {
    var params = {
        uuid: req.params.uuid,
        status: 'all',
        include: 'author,tags'
    };

    api.posts.read(params).then(function then(result) {
        // Format data 1
        var post = result.posts[0];

        if (!post) {
            return next();
        }

        if (req.params.options && req.params.options.toLowerCase() === 'edit') {
            // CASE: last param is of url is /edit, redirect to admin
            return utils.url.redirectToAdmin(302, res, '#/editor/' + post.id);
        } else if (req.params.options) {
            // CASE: unknown options param detected. Ignore and end in 404.
            return next();
        }

        if (post.status === 'published') {
            return utils.url.redirect301(res, utils.url.urlFor('post', {post: post}));
        }

        setRequestIsSecure(req, post);

        // @TODO clean this duplicate code up
        filters.doFilter('prePostsRender', post, res.locals)
            .then(function formatResult(post) {
                // Format data 2
                res.data = formatResponse.single(post);

                return next();
            });
    }).catch(handleError(next));
};

module.exports = previewController;
