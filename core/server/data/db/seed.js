var _ = require('lodash'),
    models = require('../../models'),
    common = require('../../lib/common'),
    fixtures = require('../schema/fixtures');

const seed = module.exports = function insertFixtures(options) {
    var localOptions = _.merge({
        context: {internal: true},
        migrating: true
    }, options);

    models.init();

    common.logging.info('Inserting Tags...');
    return fixtures.utils
        .addFixturesForModel(_.cloneDeep(fixtures.utils.findModelFixtures('Tag')), localOptions)
        .then(() => {
            common.logging.info('Inserting Posts...');
            return fixtures.utils
                .addFixturesForModel(_.cloneDeep(fixtures.utils.findModelFixtures('Post')), localOptions);
        })
        .then(() => {
            common.logging.info('Inserting Relations...');
            return fixtures.utils
                .addFixturesForRelation(fixtures.utils.findRelationFixture('Post', 'Tag'), localOptions);
        })
        .then(() => {
            common.logging.info('Done');
        });
};

if (require.main === module) {
    return seed({}).finally(() => {process.exit();});
}
