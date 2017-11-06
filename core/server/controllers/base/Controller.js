'use strict';
var defaultRenderer = require('../frontend/renderer'),
    errors = require('../../errors'),
    i18n = require('../../i18n');

// @TODO: make it impossible to override config, the stack that gets mounted, etc
// "main" should be overridden...
// @TODO what should main be called?
class Controller {
    constructor(config) {
        this.name = config.name;
    }

    config(req, res, next) {
        // Setup our route configuration
        res.locals.route = {};

        // Setup our data store
        res.data = {};

        next();
    }

    main(req, res, next) {
        next();
    }

    static render404(next) {
        console.log('rendering 404');
        return next(new errors.NotFoundError({message: i18n.t('errors.errors.pageNotFound')}));
    }

    mount() {
        var stack = [
            this.config.bind(this),
            this.main.bind(this)
            //defaultRenderer
        ];

        console.log('mounted', stack);


        return stack;

    }
}

module.exports = Controller;
