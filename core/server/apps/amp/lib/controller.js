var path = require('path');

module.exports.create = function createController(ghost) {
    var ampController = new ghost.controllers.CustomController({
        name: 'amp',
        defaultTemplate: path.join(__dirname, 'views', 'amp.hbs')
    });

    ampController.main = function fetchData(req, res, next) {
        ghost.urls.lookupEntry(res.locals.relativeUrl)
            .then(function formatResponse(result) {
                if (result && result.post && !result.post.page) {
                    res.data.post = result.post;
                    return next();
                }

                // return 404
                return ghost.controllers.CustomController.render404(next);
            })
            .catch(next);
    };

    return ampController;
};
