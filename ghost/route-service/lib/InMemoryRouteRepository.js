const nql = require('@tryghost/nql');

module.exports = class InMemoryRouteRepository {
    #store = [];
    #ids = {};

    toPrimitive(thing) {
        return {
            id: thing.id.toHexString(),
            path: thing.path,
            type: thing.type,
            template: thing.template
        };
    }

    async save(thing) {
        if (this.#ids[thing.id.toHexString()]) {
            const existingIndex = this.#store.findIndex((item) => {
                return item.id.equals(thing.id);
            });
            this.#store.splice(existingIndex, 1, thing);
        } else {
            this.#store.push(thing);
            this.#ids[thing.id.toHexString()] = true;
        }
    }

    async getByID(id) {
        return this.#store.find((item) => {
            return item.id.equals(id);
        });
    }

    async getPage(options) {
        const filter = nql(options.filter || '', {});
        const results = this.#store.slice().filter((item) => {
            return filter.queryJSON(this.toPrimitive(item));
        });

        if (options.limit === 'all') {
            return {
                data: results,
                meta: {
                    pagination: {
                        page: 1,
                        pages: 1,
                        limit: 'all',
                        total: results.length,
                        prev: null,
                        next: null
                    }
                }
            };
        }

        const start = (options.page - 1) * options.limit;
        const end = start + options.limit;
        const pages = Math.ceil(results.length / options.limit);
        return {
            data: results.slice(start, end),
            meta: {
                pagination: {
                    page: options.page,
                    pages: pages,
                    limit: options.limit,
                    total: results.length,
                    prev: options.page === 1 ? null : options.page - 1,
                    next: options.page === pages ? null : options.page + 1
                }
            }
        };
    }
};
