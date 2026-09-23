const {lazySingleton} = require('../../../shared/lazy-singleton');

let instance;

const service = lazySingleton('MediaInlinerService', () => instance);

async function init() {
    if (instance) {
        return;
    }

    const debug = require('@tryghost/debug')('mediaInliner');
    const MediaInliner = require('./external-media-inliner');
    const models = require('../../models');
    const jobsService = require('../jobs').service;
    const adapterManager = require('../adapter-manager').service;
    const config = require('../../../shared/config');

    const mediaStorage = adapterManager.getAdapter('storage:media');
    const imageStorage = adapterManager.getAdapter('storage:images');
    const fileStorage = adapterManager.getAdapter('storage:files');

    const mediaInliner = new MediaInliner({
        PostModel: models.Post,
        TagModel: models.Tag,
        UserModel: models.User,
        PostMetaModel: models.PostsMeta,
        getMediaStorage(extension) {
            if (config.get('uploads').images.extensions.includes(extension)) {
                return imageStorage;
            }
            if (config.get('uploads').media.extensions.includes(extension)) {
                return mediaStorage;
            }
            if (config.get('uploads').files.extensions.includes(extension)) {
                return fileStorage;
            }
            return null;
        }
    });

    instance = {
        api: {
            async startMediaInliner(domains) {
                if (!domains?.length) {
                    domains = ['https://s3.amazonaws.com/revue', 'https://substackcdn.com'];
                }

                debug('[Inliner] Starting media inlining job for domains: ', domains);

                await jobsService.addJob({
                    name: 'external-media-inliner',
                    job: data => mediaInliner.inline(data.domains),
                    data: {domains},
                    offloaded: false
                });

                return {status: 'success'};
            }
        }
    };
}

module.exports = {init, service};
