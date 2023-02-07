const ObjectID = require('bson-objectid').default;

const VALID_TYPES = ['custom', 'collection', 'entry', 'page'];

module.exports = class Route {
    /** @type {ObjectID} */
    #id;
    get id() {
        return this.#id;
    }

    /** @type {String} */
    #path;
    get path() {
        return this.#path;
    }
    set path(path) {
        this.#path = validatePath(path);
    }

    /** @type {String} */
    #type;
    get type() {
        return this.#type;
    }
    set type(type) {
        this.#type = validateType(type);
    }

    /** @type {String} */
    #template;
    get template() {
        return this.#template;
    }
    set template(template) {
        this.#template = validateTemplate(template);
    }

    toJSON() {
        return {
            id: this.id,
            path: this.path,
            type: this.type,
            template: this.template
        };
    }

    /**
    * @private
    * @param {object} data
    * @param {ObjectID} data.id
    * @param {string} data.path
    * @param {string} data.type
    * @param {string} data.template
    */
    constructor(data) {
        this.#id = data.id;
        this.#path = data.path;
        this.#type = data.type;
        this.#template = data.template;
    }

    /**
     * @param {any} data
     * @returns {Promise<Route>}
     */
    static async create(data) {
        const id = validateId(data.id);
        const path = validatePath(data.path);
        const type = validateType(data.type);
        const template = validateTemplate(data.template);

        console.log('making route', {id, path, type, template});

        return new Route({
            id,
            path,
            type,
            template
        });
    }
};

function validateId(id) {
    if (!id) {
        return new ObjectID();
    }
    if (typeof id === 'string') {
        return ObjectID.createFromHexString(id);
    }
    if (id instanceof ObjectID) {
        return id;
    }
    return new ObjectID;
}

function validatePath(path) {
    if (!path || typeof path !== 'string') {
        return '/';
    }

    return path;
}

function validateType(type) {
    if (!type || typeof type !== 'string') {
        return VALID_TYPES[0];
    }

    if (VALID_TYPES.indexOf(type) === -1) {
        return VALID_TYPES[0];
    }

    return type;
}

function validateTemplate(template) {
    if (!template || typeof template !== 'string') {
        return 'index.hbs';
    }

    return template;
}
