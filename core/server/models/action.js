const _ = require('lodash');
const ghostBookshelf = require('./base');

const Action = ghostBookshelf.Model.extend({
    tableName: 'actions',

    actor() {
        console.log('actor');
        const candidates = [];

        console.log('ALL MODELS', Object.keys(ghostBookshelf._models));

        _.each(ghostBookshelf._models, (model, key) => {
            console.log('candidate key', key);

            if (key !== 'Action' && key !== 'actor_type') {
                console.log('candidate tableName', model.prototype.tableName);
                candidates.push([model, model.prototype.tableName.replace(/s$/, '')]);
            }
        });
        return this.morphTo('actor', ['actor_type', 'actor_id'], ...candidates);
    },

    resource() {
        console.log('resource');
        const candidates = [];

        _.each(ghostBookshelf._models, (model) => {
            console.log('candidate', model.prototype.tableName);
            candidates.push([model, model.prototype.tableName.replace(/s$/, '')]);
        });
        return this.morphTo('resource', ['resource_type', 'resource_id'], ...candidates);
    },

    toJSON(unfilteredOptions) {
        const options = Action.filterOptions(unfilteredOptions, 'toJSON');
        const attrs = ghostBookshelf.Model.prototype.toJSON.call(this, options);

        // @TODO: context is not implemented yet
        delete attrs.context;

        return attrs;
    }
}, {
    orderDefaultOptions: function orderDefaultOptions() {
        return {
            created_at: 'DESC'
        };
    },

    add(data, unfilteredOptions = {}) {
        const options = this.filterOptions(unfilteredOptions, 'add');
        return ghostBookshelf.Model.add.call(this, data, options);
    }
});

module.exports = {
    Action: ghostBookshelf.model('Action', Action)
};
