/**
 * This is a dirty file for preparing a theme to be activated
 *
 * Handles checking if the theme can be activated AND
 * If the theme contains a routes.yaml
 * Checks whether this can be used, or if there is already a custom routes file in place
 */

const _ = require('lodash');
const fs = require('fs-extra');
const validate = require('./validate');
// This file is also "dirty" (tight coupling) as it is in routing, but refers to settings...
const settings = require('../routing/settings');
const config = require('../../../server/config');

const routesFileName = 'routes.yaml';

const isCurrentRoutesFileTheDefault = async () => {
    const dirtyCurrentRoutesPath = `${config.getContentPath('settings')}/${routesFileName}`;
    const dirtyDefaultRoutesPath = `${config.get('paths').defaultSettings}default-${routesFileName}`;
    const currentRoutes = await fs.readFile(dirtyCurrentRoutesPath, 'utf8');
    const defaultRoutes = await fs.readFile(dirtyDefaultRoutesPath, 'utf8');

    // @TODO: compare a checksum of the js-yaml converted version (will auto-ignore whitespace!)
    if (currentRoutes === defaultRoutes) {
        return true;
    }

    return false;
};

module.exports.prepareTheme = async (theme, isZip) => {
    let checkedTheme = await validate.checkSafe(theme, isZip);

    let dirtyRoutesThemePath = `${checkedTheme.path}/${routesFileName}`;
    let files = _.map(checkedTheme.files, 'file');

    if (!_.includes(files, 'routes.yaml')) {
        return checkedTheme;
    }

    // CASE: We have a routes.yaml file in the theme

    // If the current routes.yaml = default, then auto-override.
    if (!await isCurrentRoutesFileTheDefault()) {
        return checkedTheme;
    }

    // @TODO: If the current routes.yaml is custom & not the same as the theme, then now: error, later: prompt with override/no override
    return settings.setFromFilePath(dirtyRoutesThemePath).then(() => {
        return checkedTheme;
    });
};
