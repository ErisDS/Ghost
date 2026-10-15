module.exports = {
  get middleware() {
    return require('./middleware');
  },
  get mountDomainRoutes() {
    return require('./mount-domain-routes').mountDomainRoutes;
  },
};
