const RouteController = require('./route-controller');
const {
    InMemoryRouteRepository,
    RoutesAPI
} = require('@tryghost/route-service');

module.exports = {
    controller: new RouteController(),
    async init() {
        const repository = new InMemoryRouteRepository();
        const api = new RoutesAPI({
            repository
        });

        this.controller.init({api});
    }
};
