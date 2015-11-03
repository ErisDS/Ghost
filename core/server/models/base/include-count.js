var _ = require('lodash');

module.exports = function (Bookshelf) {
    var modelProto = Bookshelf.Model.prototype,
        Model,
        countQueryBuilder,
        postDefaultWhere,
        postPublicWhere;

    // @TODO encode this in configuration for the models and relations rather than hard coding in multiple places
    postDefaultWhere = function postDefaultWhere() {
        this.where('page', false);
    };

    postPublicWhere = function postPublicWhere() {
        this.where('page', false)
            .andWhere('status', 'published');
    };

    countQueryBuilder = {
        tags: {
            posts: function addPostCountToTags(model, isPublic) {
                isPublic = isPublic || true;
                model.query('columns', 'tags.*', function (qb) {
                    qb.count('posts.id')
                        .as('post_count')
                        .from('posts')
                        .innerJoin('posts_tags', function () {
                            this.on('posts_tags.post_id', 'posts.id')
                                .andOn('posts_tags.tag_id', 'tags.id');
                        });

                    if (isPublic) {
                        qb.where(postPublicWhere);
                    } else {
                        qb.where(postDefaultWhere);
                    }
                });
            }
        }
    };

    Model = Bookshelf.Model.extend({
        addCounts: function (options) {
            if (!options) {
                return;
            }

            var tableName = _.result(this, 'tableName');

            if (options.include && options.include.indexOf('post_count') > -1) {
                // remove post_count from withRelated and include
                options.withRelated = _.pull([].concat(options.withRelated), 'post_count');
                options.include = _.pull([].concat(options.include), 'post_count');

                // Call the query builder
                countQueryBuilder[tableName].posts(this);
            }
        },
        fetch: function () {
            this.addCounts.apply(this, arguments);

            // Call parent fetch
            return modelProto.fetch.apply(this, arguments);
        },
        fetchAll: function () {
            this.addCounts.apply(this, arguments);

            // Call parent fetchAll
            return modelProto.fetchAll.apply(this, arguments);
        }
    });

    Bookshelf.Model = Model;
};
