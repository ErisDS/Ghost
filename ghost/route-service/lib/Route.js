const ObjectID = require('bson-objectid').default;

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

    toJSON() {
        return {
            id: this.id,
            path: this.path
        };
    }

    /**
    * @private
    * @param {object} data
    * @param {ObjectID} data.id
    * @param {string} data.path
    */
    constructor(data) {
        this.#id = data.id;
        this.#path = data.path;
    }

    /**
     * @param {any} data
     * @returns {Promise<Route>}
     */
    static async create(data) {
        const id = validateId(data.id);
        const path = validatePath(data.path);

        return new Route({
            id,
            path
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
