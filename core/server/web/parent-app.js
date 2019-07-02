const debug = require('ghost-ignition').debug('web:parent');
const express = require('express');
const config = require('../config');
const common = require('../lib/common');
const compress = require('compression');
const netjet = require('netjet');
const shared = require('./shared');
const labs = require('./shared/middlewares/labs');
const membersService = require('../services/members');

module.exports = function setupParentApp(options = {}) {
    debug('ParentApp setup start');
    const parentApp = express();

    // ## Global settings

    // Make sure 'req.secure' is valid for proxied requests
    // (X-Forwarded-Proto header will be checked, if present)
    parentApp.enable('trust proxy');

    // parentApp.use(shared.middlewares.logRequest);
    parentApp.use(common.logging.request);

    // Register event emmiter on req/res to trigger cache invalidation webhook event
    parentApp.use(shared.middlewares.emitEvents);

    // enabled gzip compression by default
    if (config.get('compress') !== false) {
        parentApp.use(compress());
    }

    // Preload link headers
    if (config.get('preloadHeaders')) {
        parentApp.use(netjet({
            cache: {
                max: config.get('preloadHeaders')
            }
        }));
    }

    // This sets global res.locals which are needed everywhere
    parentApp.use(shared.middlewares.ghostLocals);

    // Mount the  apps on the parentApp

    // API
    // @TODO: finish refactoring the API app
    parentApp.use('/ghost/api', require('./api')());

    // MEMBERS
    parentApp.use('/ghost/members', labs.members, membersService.gateway);
    parentApp.use('/ghost/members/auth', labs.members, membersService.authPages);

    // ADMIN
    parentApp.use('/ghost', require('./admin')());

    // BLOG
    parentApp.use(require('./site')(options));

    debug('ParentApp setup end');

    return parentApp;
};
