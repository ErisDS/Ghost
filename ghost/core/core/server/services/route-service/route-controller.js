/**
 * @typedef {import('@tryghost/route-service/lib/route-service').RoutesAPI} RoutesAPI
 * @typedef {import('@tryghost/route-service/lib/route-service').Route} Route
 */

/**
 * @template Model
 * @typedef {import('@tryghost/route-service/lib/RoutesAPI').Page} Page<Model>
 */

module.exports = class RouteController {
    /** @type {import('@tryghost/route-service/lib/RoutesAPI')} */
    #api;

    async init(deps) {
        this.#api = deps.api;
    }
    /**
     * @param {import('@tryghost/api-framework').Frame} frame
     * @returns {Promise<Page<Route>>}
     */
    async browse(frame) {
        let limit;
        if (!frame.options.limit || frame.options.limit === 'all') {
            limit = 'all';
        } else {
            limit = parseInt(frame.options.limit);
        }

        let page;
        if (frame.options.page) {
            page = parseInt(frame.options.page);
        } else {
            page = 1;
        }

        const results = await this.#api.listRoutes({
            filter: frame.options.filter,
            limit,
            page
        });

        return results;
    }

    /**
     * @param {import('@tryghost/api-framework').Frame} frame
     * @returns {Promise<Route>}
     * @throws {NotFoundError}
    */
    async read(frame) {
        const route = await this.#api.getRouteByPath(frame.data.path);

        return route;
    }
};
