var router           = require('./lib/router'),
    registerHelpers  = require('./lib/helpers'),
    config           = require('../../config');

module.exports = {
    activate: function activate(ghost) {
        var ampRoute = '*/' + config.get('routeKeywords').amp + '/';

        registerHelpers(ghost);

        ghost.routeService.registerRouter(ampRoute, router);
    }
};
