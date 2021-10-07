const KnexMigrator = require('knex-migrator');
const knexMigrator = new KnexMigrator();

module.exports.teardown = async () => {
    return await knexMigrator.reset({force: true});
};
