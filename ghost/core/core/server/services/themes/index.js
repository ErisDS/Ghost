const activate = require('./activate');
const themeLoader = require('./loader');
const storage = require('./storage');
const getJSON = require('./to-json');
const installer = require('./installer');
const validate = require('./validate');
const settingsCache = require('../../../shared/settings-cache');
const config = require('../../../shared/config');
const {lazySingleton} = require('../../../shared/lazy-singleton');

const instance = {
    loadInactiveThemes: themeLoader.loadAllThemes,
    api: {
        getJSON,
        activate: activate.activate,
        getThemeErrors: validate.getThemeErrors,
        getZip: storage.getZip,
        setFromZip: storage.setFromZip,
        installFromGithub: installer.installFromGithub,
        destroy: storage.destroy
    }
};
let initPromise;

async function init() {
    if (!initPromise) {
        initPromise = (async () => {
            validate.init();

            const skipChecks = config.get('optimization:themes:skipBootChecks') || false;
            const themeName = settingsCache.get('active_theme');

            await activate.loadAndActivate(themeName, {skipChecks});
        })();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
    }
}

const service = lazySingleton('ThemesService', () => instance);

module.exports = {init, service};
