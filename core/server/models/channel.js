const ghostBookshelf = require('./base');

const Channel = ghostBookshelf.Model.extend({

    tableName: 'channels',

    posts: function posts() {
        return this.belongsToMany('Post');
    }

}, {
    orderDefaultOptions() {
        return {
            name: 'ASC',
            created_at: 'DESC'
        };
    }
});

const Channels = ghostBookshelf.Collection.extend({
    model: Channel
});

module.exports = {
    Channel: ghostBookshelf.model('Channel', Channel),
    Channels: ghostBookshelf.collection('Channels', Channels)
};
