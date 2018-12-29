const debug = require('ghost-ignition').debug('schema-org');
const _ = require('lodash');

class SchemaGenerator {
    constructor() {
        this.templates = require('./templates');
    }

    createSchema(type, data) {
        debug('Creating schema for', type);
        if (_.has(this.templates, type)) {
            debug('template is availalbe');
        }

        console.log(this.templates[type]);

        return this.templates[type](data);
    }
}

module.exports = SchemaGenerator;
