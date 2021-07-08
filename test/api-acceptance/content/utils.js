const url = require('url');
const tpl = require('@tryghost/tpl');
const _ = require('lodash');

const API_URL = '/ghost/api/canary/content/';

const expectedProperties = {
    // API top level
    posts: ['posts', 'meta'],
    tags: ['tags', 'meta'],
    authors: ['authors', 'meta'],
    pagination: ['page', 'limit', 'pages', 'total', 'next', 'prev'],

    post: [
        'id',
        'uuid',
        'title',
        'slug',
        'html',
        'comment_id',
        'feature_image',
        'feature_image_alt',
        'feature_image_caption',
        'featured',
        'visibility',
        'email_recipient_filter',
        'created_at',
        'updated_at',
        'published_at',
        'custom_excerpt',
        'codeinjection_head',
        'codeinjection_foot',
        'custom_template',
        'canonical_url',
        'url',
        'excerpt',
        'access',
        'og_image',
        'og_title',
        'og_description',
        'twitter_image',
        'twitter_title',
        'twitter_description',
        'meta_title',
        'meta_description',
        'email_subject',
        'frontmatter',
        'reading_time'
    ],
    author: [
        'id',
        'name',
        'slug',
        'profile_image',
        'cover_image',
        'bio',
        'website',
        'location',
        'facebook',
        'twitter',
        'meta_title',
        'meta_description'
    ],
    tag: [
        'id',
        'name',
        'slug',
        'description',
        'feature_image',
        'visibility',
        'og_image',
        'og_title',
        'og_description',
        'twitter_image',
        'twitter_title',
        'twitter_description',
        'meta_title',
        'meta_description',
        'codeinjection_head',
        'codeinjection_foot',
        'canonical_url',
        'accent_color'
    ]
};

const getValidKey = () => {
    const DataGenerator = require('../../utils/fixtures/data-generator');
    return DataGenerator.Content.api_keys[1].secret;
};

const resolveURL = (route) => {
    // new URL doesn't work for relative urls :(
    // @TODO: implement a simple url resolver https://github.com/nodejs/node/commit/0fac27d546
    return url.resolve(API_URL, route);
};

const should = require('should');

should.Assertion.add('CacheInvalidationHeaders', function (match) {
    this.params = {operator: 'to have cache invalidation headers'};
    this.obj.should.have.property('x-cache-invalidate');

    if (match) {
        this.obj['x-cache-invalidate'].should.eql(match);
    }
});

should.Assertion.add('ValidContentAPIResponse', function (resource) {

});

module.exports = {
    API: {
        getApiQuery(route) {
            return resolveURL(route);
        },

        checkResponse(...args) {
            this.expectedProperties = expectedProperties;
            const testUtils = require('../../utils');
            return testUtils.API.checkResponse.call(this, ...args);
        }
    },

    getValidKey,

    ContentAPI: {
        getURL: (routeString) => {
            let key = getValidKey();
            let route = tpl(routeString, {key});
            return resolveURL(route);
        }
    }
};
