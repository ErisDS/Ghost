const ObjectID = require('bson-objectid').default;

module.exports = class Route {
    /** @type {ObjectID} */
    #id;
    get id() {
        return this.#id;
    }

    /** @type {String} */
    #uri;
    get uri() {
        return this.#uri;
    }
    set uri(uri) {
        this.#uri = validateUri(uri);
    }

    toJSON() {
        return {
            id: this.id,
            uri: this.uri
        };
    }

    /**
    * @private
    * @param {object} data
    * @param {ObjectID} data.id
    * @param {string} data.uri
    */
    constructor(data) {
        this.#id = data.id;
        this.#uri = data.uri;
    }

    /**
     * @param {any} data
     * @returns {Promise<Thing>}
     */
    static async create(data) {
        const id = validateId(data.id);
        const uri = validateUri(data.uri);

        return new Route({
            id,
            uri
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

function validateUri(uri) {
    if (!uri || typeof uri !== 'string') {
        return '/';
    }

    return uri;
}
