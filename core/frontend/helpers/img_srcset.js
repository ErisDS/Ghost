// Usage:
// `{{img_url feature_image}}`
// `{{img_url profile_image absolute="true"}}`
// Note:
// `{{img_url}}` - does not work, argument is required
//
// Returns the URL for the current object scope i.e. If inside a post scope will return image permalink
// `absolute` flag outputs absolute URL, else URL is relative.
const _ = require('lodash');

// @TODO fix dirty require
const imgUrl = require('./img_url');

const {SafeString} = require('../services/handlebars');

module.exports = function img_srcset(requestedImageUrl, options) { // eslint-disable-line camelcase
    const imageSizes = options && options.data && options.data.config && options.data.config.image_sizes;

    let outputArray = [];

    _.each(imageSizes, (specs, size) => {
        console.log(size, specs);
        options.hash = {size};
        let img = imgUrl(requestedImageUrl, options);
        console.log('img', img);
        outputArray.push(`${img} ${specs.width}w`);
    });

    return new SafeString(outputArray.join(', '));
};
