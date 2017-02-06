var should = require('should');
var imageUtils = require('../../server/images');

describe('Images', function () {

    describe('getSrcAttribute', function () {
        it('should generate src set for array type', function () {
            var src = imageUtils.getSrcAttribute('test.png', 'test');
            console.log('src', src);
        });
    });
});
