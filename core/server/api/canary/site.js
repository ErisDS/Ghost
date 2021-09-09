const publicConfig = require('../../services/public-config');

const site = {
    docName: 'site',

    read: {
        permissions: false,
        query() {
            let result = publicConfig.site;
            result.blah = 'bloop';
            return result;
        }
    }
};

module.exports = site;
