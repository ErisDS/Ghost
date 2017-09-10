var debug = require('ghost-ignition').debug('spike:mw:setContext');

module.exports = function setContext(req, res, next) {
    debug('setContext');
    next();
};
