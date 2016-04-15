var _ = require('lodash'),
    config = require('../config');

module.exports = function isInternalApp(name) {
    return _.contains(config.internalApps, name);
};
