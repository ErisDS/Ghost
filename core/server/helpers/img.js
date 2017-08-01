// Usage: `{{img}}`
//
// Outputs HTML for an image

var proxy = require('./proxy'),
    templates = proxy.templates,
    imageUtils = proxy.images,
    url = proxy.url,
    SafeString = proxy.SafeString;


var defaultClassName = 'gh-image';
var defaultImage = 'image';

module.exports = function imgHelper(image, options) {
    var imageSrc;

    if (!this[image]) {
        return;
    }

    var imageToOutput = this[image];

    if (options.hash.type) {
        imageSrc = 'srcset="' + imageUtils.getSrc(imageToOutput, options.hash.type) + '"';
    } else {
        imageSrc = 'src="' + url.urlFor('image', {image: imageToOutput}) + '"';
    }


    var settings = {
        src: imageSrc,
        className: defaultClassName
    };

    return new SafeString(templates.image(settings));
};
