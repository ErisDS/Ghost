const should = require('should');
const sinon = require('sinon');
const configUtils = require('../../../utils/configUtils');

// Stuff we are testing
const img_srcset = require('../../../../core/frontend/helpers/img_srcset');

const logging = require('@tryghost/logging');

describe('{{img_url}} helper', function () {
    let logWarnStub;

    beforeEach(function () {
        logWarnStub = sinon.stub(logging, 'warn');
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('image_sizes', function () {
        before(function () {
            configUtils.set({url: 'http://localhost:65535/'});
        });

        after(function () {
            configUtils.restore();
        });

        it('should output correct url for absolute paths which are internal', function () {
            const rendered = img_srcset('http://localhost:65535/content/images/my-coole-img.jpg', {
                data: {
                    config: {
                        image_sizes: {
                            medium: {
                                width: 400
                            },
                            large: {
                                width: 800
                            }
                        }
                    }
                }
            });
            should.exist(rendered);
            rendered.should.equal('/content/images/size/w400/my-coole-img.jpg 400w, /content/images/size/w800/my-coole-img.jpg 800w');
        });
    });
});
