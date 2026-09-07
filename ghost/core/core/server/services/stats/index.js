const {defineService} = require('../../../shared/service-lifecycle');

let instance;

function create() {
    if (instance) {
        return instance;
    }

    const StatsService = require('./stats-service');
    const db = require('../../data/db');
    const models = require('../../models');
    const urlService = require('../url').service;
    const adapterManager = require('../adapter-manager').service;
    const config = require('../../../shared/config');

    const api = StatsService.create({
        knex: db.knex,
        models,
        urlService
    });

    const cache = config.get('hostSettings:statsCache:enabled')
        ? adapterManager.getAdapter('cache:stats')
        : null;

    instance = {api, cache};

    return instance;
}
const lifecycle = defineService({
    name: 'StatsService',
    create
});


module.exports = {init: lifecycle.init, service: lifecycle.service,
    shutdown: lifecycle.shutdown
};
