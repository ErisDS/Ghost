const debug = require('@tryghost/debug')('frontend:controllers:archive');
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const security = require('@tryghost/security');
const themeEngine = require('../services/theme-engine');
const data = require('../data');
const renderer = require('../renderer');

const messages = {
    pageNotFound: 'Page not found.'
};

/**
 * @description Channel controller.
 *
 * @TODO: The collection+rss controller do almost the same. Merge!
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Promise}
 */
module.exports = function archiveController(req, res, next) {
    debug('archiveController', req.params, res.routerOptions, req.query);

    const pathOptions = {
        page: req.params.page !== undefined ? req.params.page : 1,
        slug: req.params.slug ? security.string.safe(req.params.slug) : undefined
    };

    if (pathOptions.page) {
        // CASE 1: routes.yaml `limit` is stronger than theme definition
        // CASE 2: use `posts_per_page` config from theme as `limit` value
        if (res.routerOptions.limit) {
            themeEngine.getActive().updateTemplateOptions({
                data: {
                    config: {
                        posts_per_page: res.routerOptions.limit
                    }
                }
            });

            pathOptions.limit = res.routerOptions.limit;
        } else {
            const postsPerPage = parseInt(themeEngine.getActive().config('posts_per_page'));

            if (!isNaN(postsPerPage) && postsPerPage > 0) {
                pathOptions.limit = postsPerPage;
            }
        }
    }

    if (req.query && req.query.tag) {
        res.routerOptions.filter = `tags:${req.query.tag}+tags.visibility:public`;
    }

    return data.fetchData(pathOptions, res.routerOptions, res.locals)
        .then(function handleResult(result) {
            // CASE: requested page is greater than number of pages we have
            if (pathOptions.page > result.meta.pagination.pages) {
                return next(new errors.NotFoundError({
                    message: tpl(messages.pageNotFound)
                }));
            }

            return renderer.renderEntries(req, res)(result);
        })
        .catch(renderer.handleError(next));
};
