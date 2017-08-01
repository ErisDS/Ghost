var sharp = require('sharp'),
    path = require('path'),
    config = require('../config'),
    types = {
        large: [
            {width: '20%', rename: {suffix: '@1x'}},
            {width: '40%', rename: {suffix: '@2x'}},
            {width: '60%', rename: {suffix: '@3x'}},
            {width: '80%', rename: {suffix: '@4x'}},
            {width: '100%', rename: {suffix: '@5x'}}
        ],
        front: {width: '567px'}
    },
    imageRegex = /(\S*)\.(\w+)?$/;

module.exports.types = types;
module.exports.getSrc = function getSrc(image, type) {
    if (!types[type]) {
        return image;
    }

    var parsedImage = image.match(imageRegex) || ['', '', ''],
        name = parsedImage[1],
        ext = parsedImage[2],
        newSrc = name + '_' + type + '_' + types[type].width + '.' + ext;

        console.log('called get Src', image, type, newSrc);

    return newSrc;
};

module.exports.decodeSrc = function (src) {
    console.log('decodeSrc called with', src);
    var srcRegex = /(\S*)?_(\w+)?_(\w+)?\.(\w+)?$/,
        parsedImage = src.match(srcRegex) || ['', '', '', ''];

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
    console.log('calling generate', srcObj);

    var basePath = config.getContentPath('images').replace('/content/images', ''),
        input = path.join(basePath, srcObj.originalPath),
        output = path.join(basePath, srcObj.path),
        width = parseInt(srcObj.width.replace('px', ''), 10);

    return sharp(input)
        .resize(width, undefined, {
            interpolator:'bicubic',
            kernel: 'lanczos3',
        })
        .toFile(output);
};
