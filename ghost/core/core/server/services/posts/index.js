const PostsService = require('./posts-service');
const PostsExporter = require('./posts-exporter');
const url = require('../../../server/api/endpoints/utils/serializers/output/utils/url');
const {defineService} = require('../../../shared/service-lifecycle');

const lifecycle = defineService({
    name: 'PostsService',
    create() {
        const urlUtils = require('../../../shared/url-utils').default;
        const labs = require('../../../shared/labs');
        const models = require('../../models');
        const PostStats = require('./stats/post-stats');
        const emailService = require('../email-service');
        const settingsCache = require('../../../shared/settings-cache');
        const settingsHelpers = require('../settings-helpers');

        const postStats = new PostStats();
        const postsExporter = new PostsExporter({
            models: {
                Post: models.Post,
                Newsletter: models.Newsletter,
                Label: models.Label,
                Product: models.Product
            },
            getPostUrl(post) {
                const jsonModel = post.toJSON();
                url.forPost(post.id, jsonModel, {options: {}});
                return jsonModel.url;
            },
            settingsCache,
            settingsHelpers
        });

        return new PostsService({
            urlUtils,
            models,
            isSet: flag => labs.isSet(flag), // don't use bind, that breaks test subbing of labs
            stats: postStats,
            emailService: emailService.service,
            postsExporter
        });
    }
});

module.exports = {
    init: lifecycle.init,
    service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
