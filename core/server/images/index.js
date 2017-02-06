var debug = require('debug')('ghost:images');
var storage = require('../storage');
var sharp = require('sharp');
var path = require('path');
var config = require('../config');

var types = {
    main: [
        {width: '20%', suffix: '1x'},
        {width: '40%', suffix: '2x'},
        {width: '60%', suffix: '3x'},
        {width: '80%', suffix: '4x'},
        {width: '100%', suffix: '5x'}
    ],
    cover: [
        {width: '2000px', suffix: '2000w'},
        {width: '1000px', suffix: '1000w'},
        {width: '700px', suffix: '700w'}
    ],
    front: {width: '567px'},
    logo: {width: '120px'},
    amp: {width: '60px'}
};

var imageRegex = /(\S*?)?(?:_(\S+?))?(?:_(\S+?[px|pc]))?\.(\w+)$/;

module.exports.types = types;

function createImageName(name, type, width, ext) {
    return name + '_' + type + '_' + width + '.' + ext;
}

function createSrcSet(name, type, ext) {
    return types[type].map(function (t) {
        var imageName = createImageName(name, type, t.width, ext);
        if (t.suffix) {
            imageName += ' ' + t.suffix;
        }
        return imageName;
    }).join(', ');
}

module.exports.getSrcAttribute = function getSrcAttribute(image, type) {
    if (!types[type]) {
        return image;
    }

    var parsedImage = image.match(imageRegex) || ['', '', '', ''];
    console.log('getSrcAttribute', parsedImage);
    var name = parsedImage[1];
    var ext = parsedImage[4];
    var newSrc;

    var typeToCreate = types[type];
    if (Array.isArray(typeToCreate)) {
        newSrc = createSrcSet(name, type, ext);
    } else {
        newSrc = createImageName(name, type, types[type].width, ext);
    }

    debug('called get Src', image, type, newSrc);

    return newSrc;
};

module.exports.decodeSrc = function (src) {
    var parsedImage = src.match(imageRegex) || ['', '', '', ''];
    console.log('decodeSrc', parsedImage);
    var name = parsedImage[1];
    var type = parsedImage[2];
    var width = parsedImage[3];
    var ext = parsedImage[4];

    var decoded = {
        path: src,
        originalPath: name + '.' + ext,
        config: types[type],
        type: type,
        width: width
    };
    console.log('decoded', decoded);
    return decoded;
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
