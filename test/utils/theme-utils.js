const themeService = require('../../core/server/services/themes');

module.exports.changeTheme = async () => {
    await themeService.init();
};
