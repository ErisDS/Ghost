var mw = require('../middleware');

module.exports.entry = function entryHandler() {
    return [
        mw.fetchEntry,
        mw.setContext,
        mw.renderEntry
    ];
};

module.exports.channel = function channelHandler() {
    return [];
};
