
// Usage: `{{img}}`
//
// Outputs HTML for an image

var hbs = require('express-hbs'),
    utils  = require('../utils'),
    localUtils = require('./utils'),
    imageUtils = require('../images'),
    types,
    img;


var defaultClassName = 'gh-image';
var defaultImage = 'image';

img = function imgHelper(image, options) {
    var imageSrc;

    if (!this[image]) {
          return;
    }

    var imageToOutput = this[image];

    if (options.hash.type) {
        imageSrc = 'srcset="' + imageUtils.getSrc(imageToOutput, options.hash.type) + '"';
    } else {
        imageSrc = 'src="' + utils.url.urlFor('image', {image: imageToOutput}) + '"';
    }


    var settings = {
        src: imageSrc,
        className: defaultClassName
    };

    return new hbs.handlebars.SafeString(localUtils.imgTemplate(settings));
};

module.exports = img;
