var controller = require('./lib/controller'),
    registerHelpers = require('./lib/helpers'),

    // Dirty Requires
    settingsCache = require('../../settings/cache'),
    config = require('../../config');

module.exports = {
    activate: function activate(ghost) {
        var ampRoute = '*/' + config.get('routeKeywords').amp + '/';
        var ampController = controller.create(ghost);

        registerHelpers(ghost);

        ghost.routeService.registerRouter(ampRoute, function enabledController(req, res, next) {
            if (settingsCache.get('amp')) {
                console.log('WE ARE IN AMP LAND');
                return ampController.mount(req, res, next);
            }

            return next();
        });
    }
};
