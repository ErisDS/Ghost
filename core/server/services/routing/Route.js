var defaultController = function defaultController(req, res) {
    res.send('OK');
};

class Route {
    constructor(options) {
        options = options || {};

        this.method = options.method || 'get';
        this.path = options.path || '/';
        this.controller = options.controller || defaultController;
    }

    mount(parentRouter) {
        parentRouter[this.method](this.path, this.controller);
    }
}

module.exports = Route;
