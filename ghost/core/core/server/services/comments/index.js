const {defineService} = require('../../../shared/service-lifecycle');

const instance = {};

function create() {
    const CommentsService = require('./comments-service');
    const CommentsController = require('./comments-controller');
    const CommentsStats = require('./comments-stats-service');
    const config = require('../../../shared/config');
    const logging = require('@tryghost/logging');
    const models = require('../../models');
    const {GhostMailer} = require('../mail');
    const settingsCache = require('../../../shared/settings-cache');
    const urlService = require('../url').service;
    const urlUtils = require('../../../shared/url-utils').default;
    const membersService = require('../members').service;
    const db = require('../../data/db');
    const settingsHelpers = require('../settings-helpers').service;

    const api = new CommentsService({
        config,
        logging,
        models,
        mailer: new GhostMailer(),
        settingsCache,
        settingsHelpers,
        urlService,
        urlUtils,
        contentGating: membersService.contentGating
    });

    const stats = new CommentsStats({db});
    instance.api = api;
    instance.controller = new CommentsController(api, stats);

    return instance;
}
const lifecycle = defineService({
    name: 'CommentsService',
    create,
    reinitialize: true
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
