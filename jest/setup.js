if (!process.env.NODE_ENV || process.env.NODE_ENV === 'test') {
    process.env.NODE_ENV = 'testing';
}

require('../core/server/overrides');

const testUtils = require('../test/utils/');

module.exports = async () => {
    return await testUtils.startGhost();
};
