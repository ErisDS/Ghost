var debug = require('ghost-ignition').debug('spike:mw:renderEntry');

module.exports = function renderEntry(req, res, next) {
    var template = 'post';

    debug('renderEntry');
    return res.render(template, res.data);
};
