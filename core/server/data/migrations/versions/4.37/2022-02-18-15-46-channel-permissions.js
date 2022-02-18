const {
    addPermissionWithRoles,
    combineTransactionalMigrations
} = require('../../utils');

module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Browse channels',
        action: 'browse',
        object: 'channel'
    }, [
        'Administrator',
        'Editor'
    ]),
    addPermissionWithRoles({
        name: 'Read channels',
        action: 'read',
        object: 'channel'
    }, [
        'Administrator',
        'Editor'
    ]),
    addPermissionWithRoles({
        name: 'Edit channels',
        action: 'edit',
        object: 'channel'
    }, [
        'Administrator',
        'Editor'
    ]),
    addPermissionWithRoles({
        name: 'Add channels',
        action: 'add',
        object: 'channel'
    }, [
        'Administrator',
        'Editor'
    ]),
    addPermissionWithRoles({
        name: 'Delete channels',
        action: 'destroy',
        object: 'channel'
    }, [
        'Administrator',
        'Editor'
    ])
);
