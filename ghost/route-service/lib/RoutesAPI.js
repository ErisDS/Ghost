module.exports = class RoutesAPI {
    /** @type {IRouteRepository} */
    #repository;

    constructor(deps) {
        this.#repository = deps.repository;
    }

    /**
  * @param {object} options
  * @returns {Promise<Page<Route>>}
  */
    async listRoutes(options) {
        /** @type {GetPageOptions} */
        let pageOptions;

        if (options.limit === 'all') {
            pageOptions = {
                filter: options.filter,
                limit: options.limit
            };
        } else {
            pageOptions = {
                filter: options.filter,
                limit: options.limit,
                page: options.page
            };
        }

        const page = await this.#repository.getPage(pageOptions);

        return page;
    }

    async getRouteByPath(path) {
        const route = await this.#repository.getByPath(path);

        return route;
    }
};
