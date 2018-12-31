const debug = require('ghost-ignition').debug('schema-org');
const _ = require('lodash');

// @TODO move and depend on handlebars directly
const handlebars = require('../../../services/themes/engine').handlebars;

class SchemaGenerator {
    constructor() {
        this.loadTemplates();
        this.loadPartials();
    }

    loadTemplates() {
        // @TODO refactor to use a readdir type thing
        let templateFiles = require('./templates');
        this.templates = {};
        _.forEach(templateFiles, (template, name) => {
            this.templates[name] = handlebars.compile(template);
        });
    }

    loadPartials() {
        // @TODO refactor to use a readdir type thing
        let partialFiles = require('./partials');
        _.forEach(partialFiles, (partial, name) => {
            handlebars.registerPartial(name, partial);
        });
    }

    createSchema(type, data) {
        debug('Creating schema for', type);
        if (_.has(this.templates, type)) {
            debug('template is available');
        }

        debug('executing template with', data);
        return this.templates[type](data);
    }
}

module.exports = SchemaGenerator;
