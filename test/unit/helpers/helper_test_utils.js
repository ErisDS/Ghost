// URGH
const helpers = require('../../../core/frontend/helpers');
const handlebars = require('../../../core/frontend/services/themes/engine').handlebars;

module.exports.helpers = helpers;

module.exports.shouldCompileToExpected = function shouldCompileToExpected(templateString, hash, expected) {
    const template = handlebars.compile(templateString);
    const result = template(hash);

    result.should.eql(expected);
};

module.exports.handlebars = handlebars;
