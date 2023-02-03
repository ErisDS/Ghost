const RouteController = require('./route-controller');
const {
    InMemoryRouteRepository,
    Route,
    RoutesAPI
} = require('@tryghost/route-service');

const loadFakeRoutes = async (repository) => {
    const home = await Route.create({uri: '/'});
    const test = await Route.create({uri: '/test/'});

    await repository.save(home);
    await repository.save(test);
};

module.exports = {
    controller: new RouteController(),
    async init() {
        const repository = new InMemoryRouteRepository();

        const api = new RoutesAPI({
            repository
        });

        await loadFakeRoutes(repository);

        this.controller.init({api});
    }
};
