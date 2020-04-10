/**
 * Dependencies
 */

const _ = require('lodash');
const glob = require('glob');

// enable event listeners
require('./base/listeners');

/**
 * Expose all models
 */
exports = module.exports;

// We use glob here because it's already a dependency
// If we want to get rid of glob we could use E.g. requiredir
// Or require('fs').readdirSync(__dirname + '/')
const modelFiles = glob.sync('!(index).js', {cwd: __dirname}).reverse();

function init() {
    exports.Base = require('./base');

    modelFiles.forEach(function (model) {
        let name = model.replace(/.js$/, '');
        _.extend(exports, require('./' + name));
    });

    console.log('loaded all');
}

/**
 * Expose `init`
 */

exports.init = init;
