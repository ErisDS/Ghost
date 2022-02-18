const router = require('../../shared/express').Router();
const controllers = require('../controllers');

router.get('/archive/', (req, res, next) => {
    res.routerOptions = {
        type: 'channel'
    };
    return controllers.channel(req, res, next);
});

router.get('/author/:slug/', (req, res, next) => {
    res.routerOptions = {
        filter: 'authors:\'%s\'',
        editRedirect: '#/settings/staff/:slug/',
        resource: 'authors'
    };
    return controllers.channel(req, res, next);
});

router.get('/:slug/', (req, res, next) => {
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

module.exports = () => {
    return (req, res, next) => {
        console.log('We are routing');
        router(req, res, next);
    };
};
