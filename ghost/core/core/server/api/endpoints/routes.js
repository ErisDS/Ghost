const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const routes = require('../../services/route-service');

const messages = {
    routeNotFound: 'Route not found.'
};

module.exports = {
    docName: 'routes',
    browse: {
        options: [
            'filter',
            'fields',
            'limit',
            'order',
            'page',
            'debug'
        ],
        permissions: false,
        query(frame) {
            return routes.controller.browse(frame);
        }
    },

    read: {
        headers: {},
        data: [
            'id',
            'path'
        ],
        permissions: false,
        async query(frame) {
            const route = await routes.controller.read(frame);

            if (!route) {
                throw new errors.NotFoundError({
                    message: tpl(messages.routeNotFound)
                });
            }

            return route;
        }
    }
};
