const _ = require('lodash');
const settingsCache = require('../../core/shared/settings-cache');

module.exports.stubGet = (sinon, mockValues) => {
    // Example call
    // settingsCacheUtils.stubGet(sinon, { labs: { members: true }, active_theme: 'price-data-test-theme' });

    const originalSettingsCacheGetFn = settingsCache.get;

    sinon.stub(settingsCache, 'get').callsFake(function (key, options) {
        // If we were passed a mock value, use that
        if (_.has(mockValues, key)) {
            return mockValues[key];
        }
        return originalSettingsCacheGetFn(key, options);
    });
};

module.exports.get = settingsCache.get;
