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
let initKey;
let initializedKey;

async function init() {
    const themeName = settingsCache.get('active_theme');
    const key = `${config.getContentPath('themes')}:${themeName}`;

    if (initializedKey === key) {
        return;
    }

    if (initPromise && initKey !== key) {
        await initPromise;
        return init();
    }

    if (!initPromise) {
        initKey = key;
        initPromise = (async () => {
            validate.init();

            const skipChecks = config.get('optimization:themes:skipBootChecks') || false;

            await activate.loadAndActivate(themeName, {skipChecks});
            initializedKey = key;
        })();
    }

    try {
        await initPromise;
    } finally {
        initPromise = undefined;
        initKey = undefined;
    }
}

const service = lazySingleton('ThemesService', () => instance);

module.exports = {init, service};
