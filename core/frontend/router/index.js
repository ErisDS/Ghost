const router = require('./routes');

module.exports = () => {
    const mount = router();
    return (req, res, next) => {
        console.log('We are routing');
        mount(req, res, next);
    };
};
