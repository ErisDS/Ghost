const db = require('./utils/db');
module.exports = async () => {
    return await db.teardown();
};
