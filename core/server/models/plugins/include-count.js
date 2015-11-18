var _ = require('lodash');

module.exports = function (Bookshelf) {
    var modelProto = Bookshelf.Model.prototype,
        Model,
        countQueryBuilder;

    countQueryBuilder = {
        tags: {
            posts: function addPostCountToTags(model) {
                model.query('columns', 'tags.*', function (qb) {
                    qb.count('posts.id')
                        .from('posts')
                        .leftOuterJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
                        .whereRaw('posts_tags.tag_id = tags.id')
                        .as('count__posts');

                    if (model.isPublicContext()) {
                        // @TODO use the filter behavior for posts
                        qb.andWhere('posts.page', '=', false);
                        qb.andWhere('posts.status', '=', 'published');
                    }
                });
            }
        },
        users: {
            posts: function addPostCountToTags(model) {
                model.query('columns', 'users.*', function (qb) {
                    qb.count('posts.id')
                        .from('posts')
                        .whereRaw('posts.author_id = users.id')
                        .as('count__posts');

                    if (model.isPublicContext()) {
                        // @TODO use the filter behavior for posts
                        qb.andWhere('posts.page', '=', false);
                        qb.andWhere('posts.status', '=', 'published');
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

            if (options.include && options.include.indexOf('count.posts') > -1) {
                // remove post_count from withRelated and include
                options.withRelated = _.pull([].concat(options.withRelated), 'count.posts');
                options.include = _.pull([].concat(options.include), 'count.posts');

                // Call the query builder
                countQueryBuilder[tableName].posts(this);
            }
        },
        fetch: function () {
            this.addCounts.apply(this, arguments);

            if (this.debug) {
                console.log('QUERY', this.query().toQuery());
            }

            // Call parent fetch
            return modelProto.fetch.apply(this, arguments);
        },
        fetchAll: function () {
            this.addCounts.apply(this, arguments);

            if (this.debug) {
                console.log('QUERY', this.query().toQuery());
            }

            if (this.debug) {
                console.log('QUERY', this.query().toQuery());
            }

            // Call parent fetchAll
            return modelProto.fetchAll.apply(this, arguments);
        },

        finalize: function (attrs) {
            if (_.has(attrs, 'count__posts')) {
                attrs.count = attrs.count || {};
                attrs.count.posts = attrs.count__posts;
                delete attrs.count__posts;
            }

            return attrs;
        }
    });

    Bookshelf.Model = Model;
};
