'use strict';
var Controller = require('./Controller');

class ChannelController extends Controller {
    config(req, res, next) {
        super.config.apply(this, arguments);

        res.locals.route = {
            type: 'channel'
        };

        console.log('config', res.locals);

        next();
    }
}

module.exports = ChannelController;
