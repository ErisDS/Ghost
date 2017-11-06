'use strict';
var Controller = require('./Controller');

class EntryController extends Controller {
    config(req, res, next) {
        super.config.apply(this, arguments);

        res.locals.route = {
            type: 'single'
        };

        console.log('config', res.locals);

        next();
    }

    // mount() {
    //     console.log('entry');
    //     return [
    //         function test(req, res, next) {
    //             console.log('requested test', res.locals);
    //             next();
    //
    //         },
    //         function test2(req, res, next) {
    //             console.log('requested test2', res.locals);
    //         }
    //     ]
    // }
}

module.exports = EntryController;
