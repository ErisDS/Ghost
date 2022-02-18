const {addTable} = require('../../utils');

module.exports = addTable('posts_channels', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    post_id: {type: 'string', maxlength: 24, nullable: false, references: 'posts.id', cascadeDelete: true},
    channel_id: {type: 'string', maxlength: 24, nullable: false, references: 'channels.id', cascadeDelete: true},
    sort_order: {type: 'integer', nullable: false, unsigned: true, defaultTo: 0}
});
