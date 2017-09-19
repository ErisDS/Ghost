require('../../helpers').loadCoreHelpers();

module.exports.middleware = require('../../themes').middleware;

module.exports.errorHandler = function themeErrorHandler(err, req, res, next) {
    console.log(err);
    res.send('ERROR');
};
