const router = require('../../shared/express').Router();
const controllers = require('../controllers');

const routeNames = {
    archive: '/archive/',
    authors: '/author/:slug',
    pages: '/:slug/',
    posts: '/:slug/'
};

router.get(routeNames.archive, (req, res, next) => {
    res.routerOptions = {
        type: 'channel'
    };
    return controllers.channel(req, res, next);
});

router.get(routeNames.authors, (req, res, next) => {
    res.routerOptions = {
        filter: 'authors:\'%s\'',
        editRedirect: '#/settings/staff/:slug/',
        resource: 'authors'
    };
    return controllers.channel(req, res, next);
});

// Do pages
router.get(routeNames.pages, (req, res, next) => {
    res.routerOptions = {
        type: 'entry',
        permalinks: '/:slug/',
        query: {
            controller: 'pagesPublic',
            type: 'read',
            resource: 'pages',
            options: {
                slug: '%s'
            }
        }
    };

    return controllers.entry(req, res, next);
});

// Do posts
router.get(routeNames.posts, (req, res, next) => {
    res.routerOptions = {
        type: 'entry',
        permalinks: '/:slug/',
        query: {
            controller: 'postsPublic',
            type: 'read',
            resource: 'posts',
            options: {
                slug: '%s'
            }
        }
    };

    return controllers.entry(req, res, next);
});

module.exports = router;
