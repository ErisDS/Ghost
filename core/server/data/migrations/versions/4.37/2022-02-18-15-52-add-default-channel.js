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

        const channels = await knex('channels').select('id').where('slug', 'home');

        const posts = await knex('posts').select('id');

        const postsChannels = posts.map((post) => {
            return {
                id: ObjectID().toHexString(),
                post_id: post.id,
                channel_id: channels[0].id,
                sort_order: 0
            };
        });

        await knex('posts_channels').insert(postsChannels);
    },
    async function down(knex) {
        logging.info('Removing default post channel relations');
        await knex('posts_channels').truncate(); // @TODO do this properly

        logging.info('Removing default index channel');
        await knex('channels')
            .where('name', 'Index')
            .del();
    }
);
