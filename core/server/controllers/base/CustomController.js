'use strict';
var Controller = require('./Controller');

class CustomController extends Controller {
    constructor(config) {
        super(config);

        this.templateName = config.templateName || config.name;
        this.defaultTemplate = config.defaultTemplate;
    }

    config(req, res, next) {
        super.config.apply(this, arguments);

        res.locals.route = {
            type: 'custom',
            templateName: this.templateName,
            defaultTemplate: this.defaultTemplate
        };

        console.log('config', res.locals);

        next();
    }
}

module.exports = CustomController;
