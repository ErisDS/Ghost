const urlUtils = require('../../../shared/url-utils');
const storage = require('../../adapters/storage');
const storageUtils = require('../../adapters/storage/utils');
const config = require('../../../shared/config');
const settingsCache = require('../../../shared/settings-cache');
const ImageUtils = require('./image-utils');

module.exports = new ImageUtils({config, urlUtils, settingsCache, storageUtils, storage});
