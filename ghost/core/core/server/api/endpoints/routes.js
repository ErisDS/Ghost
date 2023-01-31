const routes = require('../../services/route-service');

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
    }
};
