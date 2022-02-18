const router = require('./routes');

module.exports = () => {
    return (req, res, next) => {
        console.log('We are routing');
        router(req, res, next);
    };
};
