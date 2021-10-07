const db = require('./utils/db');

module.exports = async () => {
    // Do any tasks that need to run once before we do testing
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'test') {
        process.env.NODE_ENV = 'testing';
    }

    require('../core/server/overrides');
    // await db.teardown();
};
