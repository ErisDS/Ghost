var storage = require('../storage');
var sharp = require('sharp');
var path = require('path');
var config = require('../config');

var types = {
    large: [
        {width: '20%', rename: {suffix: '@1x'}},
        {width: '40%', rename: {suffix: '@2x'}},
        {width: '60%', rename: {suffix: '@3x'}},
        {width: '80%', rename: {suffix: '@4x'}},
        {width: '100%', rename: {suffix: '@5x'}}
    ],
    front: {width: '567px'}
};

var imageRegex = /(\S*)\.(\w+)?$/;

module.exports.types = types;
module.exports.getSrc = function getSrc(image, type) {
    if (!types[type]) {
        return image;
    }

    var parsedImage = image.match(imageRegex) || ['', '', ''];
    var name = parsedImage[1];
    var ext = parsedImage[2];
    var newSrc = name + '_' + type + '_' + types[type].width + '.' + ext;
    console.log('called get Src', image, type, newSrc);

    return newSrc;
};

module.exports.decodeSrc = function (src) {
    var srcRegex = /(\S*)?_(\w+)?_(\w+)?\.(\w+)?$/;
    var parsedImage = src.match(srcRegex) || ['', '', '', ''];
    console.log('decodeSrc', parsedImage);
    var name = parsedImage[1];
    var type = parsedImage[2];
    var width = parsedImage[3];
    var ext = parsedImage[4];

    return {
        path: src,
        originalPath: name + '.' + ext,
        config: types[type],
        type: type,
        width: width
    };
};

module.exports.generate = function (srcObj) {
    var basePath = config.getContentPath('images').replace('/content/images', '');
    var input = path.join(basePath, srcObj.originalPath);
    var output = path.join(basePath, srcObj.path);
    var width = parseInt(srcObj.width.replace('px', ''), 10);

    return sharp(input)
        .resize(width, undefined, {
            interpolator:'bicubic',
            kernel: 'lanczos3',
        })
        .toFile(output);
};
