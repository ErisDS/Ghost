var debug = require('ghost-ignition').debug('spike:mw:renderEntry');

module.exports = function renderEntry(req, res, next) {
    debug('renderEntry');
    next();
};
