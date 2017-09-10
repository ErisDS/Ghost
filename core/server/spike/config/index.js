var config = require('../../config');

function loadExtras() {
    config.file('extras', './extras.json');
    return config;
}

module.exports = loadExtras();
