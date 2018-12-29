const escapeExpression = require('../../../../services/themes/engine').escapeExpression;

module.exports = (strings, ...keys) => {
    console.log('got keys', keys);
    return (function (...values) {
        var dict = values[values.length - 1] || {};
        console.log('got values', dict);
        let result = [strings[0]];

        keys.forEach(function (key, i) {
            let rawValue = dict[key];
            let value = (typeof rawValue === 'string') ? escapeExpression(rawValue) : rawValue;

            result.push(value, strings[i + 1]);
        });

        return result.join('');
    });
};
