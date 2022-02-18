const router = require('../../shared/express').Router();
const controllers = require('../controllers');

router.get('/archive/', (req, res, next) => {
    res.routerOptions = {
        type: 'channel'
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

    console.log('entry controller');

    return controllers.entry(req, res, next);
});

module.exports = () => {
    return (req, res, next) => {
        console.log('We are routing');
        router(req, res, next);
    };
};
