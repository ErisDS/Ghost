const should = require('should');

// Stuff we are testing
const helpers = require('../../../core/frontend/helpers');
const handlebars = require('../../../core/frontend/services/themes/engine').handlebars;

describe('{{content}} helper', function () {
    describe('(compile)', function () {
        function shouldCompileToExpected(templateString, hash, expected) {
            const template = handlebars.compile(templateString);
            const result = template(hash);

            result.should.eql(expected);
        }

        before(function () {
            handlebars.registerPartial('content', '<div>{{content}}</div>')
            handlebars.registerHelper('content', helpers.content);
        });

        /** Many of these are copied direct from the handlebars spec */
        it('object and @key', function () {
            const templateString = '<ul>{{#foreach posts}}<li>{{@key}} {{title}}</li>{{/foreach}}</ul>';
            const expected = '<ul><li>first first</li><li>second second</li><li>third third</li><li>fourth fourth</li><li>fifth fifth</li></ul>';

            shouldCompileToExpected(templateString, objectHash, expected);
        });


    it('renders empty string when null', function () {
        const html = null;
        const rendered = helpers.content.call({html: html});

        should.exist(rendered);
        rendered.string.should.equal('');
    });

    it('can render content', function () {
        const html = 'Hello World';
        const rendered = helpers.content.call({html: html});

        should.exist(rendered);
        rendered.string.should.equal(html);
    });

    it('can truncate html by word', function () {
        const html = '<p>Hello <strong>World! It\'s me!</strong></p>';

        const rendered = (
            helpers.content
                .call(
                    {html: html},
                    {hash: {words: 2}}
                )
        );

        should.exist(rendered);
        rendered.string.should.equal('<p>Hello <strong>World!</strong></p>');
    });

    it('can truncate html to 0 words', function () {
        const html = '<p>Hello <strong>World! It\'s me!</strong></p>';

        const rendered = (
            helpers.content
                .call(
                    {html: html},
                    {hash: {words: '0'}}
                )
        );

        should.exist(rendered);
        rendered.string.should.equal('');
    });

    it('can truncate html by character', function () {
        const html = '<p>Hello <strong>World! It\'s me!</strong></p>';

        const rendered = (
            helpers.content
                .call(
                    {html: html},
                    {hash: {characters: 8}}
                )
        );

        should.exist(rendered);
        rendered.string.should.equal('<p>Hello <strong>Wo</strong></p>');
    });
});
