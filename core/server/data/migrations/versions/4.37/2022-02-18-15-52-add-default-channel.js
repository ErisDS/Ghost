const {createTransactionalMigration} = require('../../utils');
const ObjectID = require('bson-objectid');
const logging = require('@tryghost/logging');

module.exports = createTransactionalMigration(
    async function up(knex) {
        const [result] = await knex
            .count('id', {as: 'total'})
            .from('channels');

        if (result.total !== 0) {
            logging.warn(`Not adding default index channel, a channel already exists`);
            return;
        }

        const name = 'Home';
        const id = ObjectID().toHexString();

        logging.info(`Adding channel "${name}"`);
        await knex('channels')
            .insert({
                id: id,
                name: name,
                slug: 'home',
                description: 'Default post list',
                type: 'automated',
                route: '/',
                created_at: knex.raw(`CURRENT_TIMESTAMP`)
            });
    },
    async function down(knex) {
        logging.info('Removing default index channel');
        await knex('channels')
            .where('name', 'Index')
            .del();
    }
);
