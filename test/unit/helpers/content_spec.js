const should = require('should');

// Stuff we are testing
const {helpers, handlebars, shouldCompileToExpected} = require('./helper_test_utils');

describe('{{content}} helper', function () {
    before(function () {
        handlebars.registerPartial('somepartial', '<div>{{content}}</div>');
        handlebars.registerHelper('content', helpers.content);
    });

    it('can render content', function () {
        const hashObj = {html: '<h1>Hello World</h1>'};

        const templateString = '<div>{{content}}</div>';
        const expected = '<div><h1>Hello World</h1></div>';

        shouldCompileToExpected(templateString, hashObj, expected);
    });

    it('renders empty string when null', function () {
        const hashObj = {html: null};

        const templateString = '<div>{{content}}</div>';
        const expected = '<div></div>';

        shouldCompileToExpected(templateString, hashObj, expected);
    });

    it('renders CTA when access is false', function () {
        const hashObj = {
            html: null,
            access: false
        };

        const templateString = '<div>{{content}}</div>';
        const expected = '<div>CTA HERE</div>';

        shouldCompileToExpected(templateString, hashObj, expected);
    });

    it('allows content to be wrapped in a partial', function () {
        const hashObj = {
            html: '<h1>Hello World</h1>'
        };

        const templateString = '<div>{{> somepartial}}</div>';
        const expected = '<div><div><h1>Hello World</h1></div></div>';

        shouldCompileToExpected(templateString, hashObj, expected);
    });

    describe('partial called content contains content helper', function () {
        beforeEach(function () {
            handlebars.registerPartial('content', '<div>{{content}}</div>');
        });

        it('allows content to be wrapped in a partial called content with access undefined', function () {
            const hashObj = {
                html: '<h1>Hello World</h1>'
            };

            const templateString = '<div>{{> "content"}}</div>';
            const expected = '<div><div><h1>Hello World</h1></div></div>';

            shouldCompileToExpected(templateString, hashObj, expected);
        });

        it('allows content to be wrapped in a partial called content with access false', function () {
            const hashObj = {
                html: '<h1>Hello World</h1>',
                access: false
            };

            const templateString = '<div>{{> "content"}}</div>';
            const expected = '<div><div>CTA HERE</div></div>';

            shouldCompileToExpected(templateString, hashObj, expected);
        });

        it('allows content to be wrapped in a partial called content with access true', function () {
            const hashObj = {
                html: '<h1>Hello World</h1>',
                access: true
            };

            const templateString = '<div>{{> "content"}}</div>';
            const expected = '<div><div><h1>Hello World</h1></div></div>';

            shouldCompileToExpected(templateString, hashObj, expected);
        });
    });

    it('can truncate html by word', function () {
        const hashObj = {
            html: '<p>Hello <strong>World! It\'s me!</strong></p>'
        };

        const templateString = '{{content words="2"}}';
        const expected = '<p>Hello <strong>World!</strong></p>';

        shouldCompileToExpected(templateString, hashObj, expected);
    });

    it('can truncate html to 0 words', function () {
        const hashObj = {html: '<p>Hello <strong>World! It\'s me!</strong></p>'};

        const templateString = '{{content words="0"}}';
        const expected = '';

        shouldCompileToExpected(templateString, hashObj, expected);
    });

    it('can truncate html by character', function () {
        const hashObj = {html: '<p>Hello <strong>World! It\'s me!</strong></p>'};

        const templateString = '{{content characters="8"}}';
        const expected = '<p>Hello <strong>Wo</strong></p>';

        shouldCompileToExpected(templateString, hashObj, expected);
    });
});
