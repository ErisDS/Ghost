const checkType = require('./checks');
const urlUtils = require('../../shared/url-utils');

module.exports = (thing, absolute) => {
    if (checkType.isPost(thing)) {
        return `/${thing.slug}/`;
    }

    if (checkType.isAuthor(thing)) {
        return `/author/${thing.slug}/`;
    }

    if (checkType.isTag(thing)) {
        return `/archive/?tag=${thing.slug}`;
    }

    if (checkType.isNav(thing)) {
        return urlUtils.urlFor('nav', {nav: thing, secure: thing.secure}, absolute);
    }
};
