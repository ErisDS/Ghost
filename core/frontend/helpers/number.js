// # Number Helper
// Usage: `{{number}}`
const _ = require('lodash');
const {SafeString} = require('../services/proxy');

// We use the name meta_title to match the helper for consistency:
module.exports = function number(options) { // eslint-disable-line camelcase
    let page = _.get(options, 'data._parent.root.pagination.page') || 1;
    let pageSize = _.get(options, 'data._parent.root.pagination.limit') || 15;
    let pageOffset = pageSize * (page - 1);

    let index = options.data.index;

    let output = index + pageOffset + 1;

    return new SafeString(output);
};
