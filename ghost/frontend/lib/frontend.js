const debug = require('@tryghost/debug')('newfe');

module.exports = class Frontend {
    constructor({express}) {
        this.app = express('newfe');

        this.app.get('/', (req, res) => {
            debug('SERVING NEW FE');
            res.send('Frontend 2.0!');
        });
    }
};

// const express = require('../../../shared/express');
// const shared = require('../shared');

// /**
//  *
//  * @param {import('../../../frontend/services/routing/router-manager').RouterConfig} routerConfig
//  * @returns {import('express').RequestHandler}
//  */
// module.exports = (routerConfig) => {
//     debug('FrontendApp setup start', routerConfig);

//     // FRONTEND
//     const frontendApp = express('frontend');

//     // Force SSL if blog url is set to https. The redirects handling must happen before asset and page routing,
//     // otherwise we serve assets/pages with http. This can cause mixed content warnings in the admin app.
//     frontendApp.use(shared.middleware.urlRedirects.frontendSSLRedirect);

//     frontendApp.lazyUse('/members', require('../members'));
//     frontendApp.lazyUse('/webmentions', require('../webmentions'));
//     frontendApp.use('/', require('../../../frontend/web')(routerConfig));

//     return frontendApp;
// };
