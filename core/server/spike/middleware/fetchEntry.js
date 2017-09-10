var debug = require('ghost-ignition').debug('spike:mw:fetchEntry');

module.exports = function fetchEntry(req, res, next) {
    console.log(req.url, req.path, req.originalUrl);

    debug('fetchEntry');
    next();
};
