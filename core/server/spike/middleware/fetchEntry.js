var debug = require('ghost-ignition').debug('spike:mw:fetchEntry');
var entryService = require('../services/entry');

module.exports = function fetchEntry(req, res, next) {
    debug('fetchEntry');

    res.params = {
        query: entryService.urlToQuery(res.locals.relativeUrl)
    };

    return entryService
        .lookup(res.params)
        .then(function (result) {
            res.data = entryService.format(result);
            console.log('ENTRY', res.data);
            next();
        })
        .catch(next);
};
