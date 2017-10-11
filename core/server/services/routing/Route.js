var debug = require('ghost-ignition').debug('routing:Route');
var magic = require('../magic');

class Route {
    constructor(options) {
        options = options || {};

        this.name = options.name || 'default';
        this.method = options.method || 'get';
        this.path = options.path || '/';
        this.controller = options.controller || magic.customMagic();
    }

    config() {
        return {
            name: this.name,
            path: this.path
        }
    }

    configMW () {
        var config = this.config();
        return function routeConfig(req, res, next) {
            // We only set the route if this route doesn't already have a route config
            res.locals.config.route = res.locals.config.route || config;
            next();
        }
    }

    mount(parentRouter) {
        debug('mounting', this.method, this.path);
        parentRouter[this.method](this.path, this.configMW(), this.controller);
    }
}

module.exports = Route;
