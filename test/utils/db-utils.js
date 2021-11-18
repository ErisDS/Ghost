const debug = require('@tryghost/debug')('test:dbUtils');

// Utility Packages
const Promise = require('bluebird');
const KnexMigrator = require('knex-migrator');
const knexMigrator = new KnexMigrator();

// Ghost Internals
const config = require('../../core/shared/config');
const db = require('../../core/server/data/db');
const schema = require('../../core/server/data/schema').tables;
const schemaTables = Object.keys(schema);

// Other Test Utilities
const urlServiceUtils = require('./url-service-utils');

async function truncateSQLite(tables) {
    try {
        await db.knex.raw('PRAGMA journal_mode = TRUNCATE;');
        await db.knex.raw('PRAGMA synchronous = OFF;');
        const [foreignKeysEnabled] = await db.knex.raw('PRAGMA foreign_keys;');
        if (foreignKeysEnabled.foreign_keys) {
            await db.knex.raw('PRAGMA foreign_keys = OFF;');
        }
        for (const table of tables) {
            await db.knex.raw('DELETE FROM ' + table + ';');
        }

        if (foreignKeysEnabled.foreign_keys) {
            await db.knex.raw('PRAGMA foreign_keys = ON;');
        }

        return;
    } catch (err) {
        // CASE: table does not exist
        if (err.errno === 1) {
            return;
        }

        throw err;
    }
}

async function truncateMySQL(tables) {
    return db.knex.transaction(function (trx) {
        return db.knex.raw('SET FOREIGN_KEY_CHECKS=0;').transacting(trx)
            .then(function () {
                return Promise
                    .each(tables, function createTable(table) {
                        return db.knex.raw('TRUNCATE ' + table + ';').transacting(trx);
                    });
            })
            .then(function () {
                return db.knex.raw('SET FOREIGN_KEY_CHECKS=1;').transacting(trx);
            })
            .catch(function (err) {
                // CASE: table does not exist
                if (err.errno === 1146) {
                    return Promise.resolve();
                }

                throw err;
            });
    });
}

module.exports.initData = async () => {
    await knexMigrator.init();
    await urlServiceUtils.reset();
    await urlServiceUtils.init();
    await urlServiceUtils.isFinished();
};

module.exports.truncate = async (...tables) => {
    if (config.get('database:client') === 'sqlite3') {
        return await truncateSQLite(tables);
    }

    return await truncateMySQL(tables);
};

// we must always try to delete all tables
module.exports.clearData = async () => {
    debug('Database reset');
    await knexMigrator.reset({force: true});
    urlServiceUtils.reset();
};

/**
 * Has to run in a transaction for MySQL, otherwise the foreign key check does not work.
 * Sqlite3 has no truncate command.
 */
module.exports.teardown = async (...tables) => {
    debug('Database teardown');
    urlServiceUtils.reset();

    if (tables.length === 0) {
        tables = schemaTables.concat(['migrations']);
    }

    return module.exports.truncate(...tables);
};
