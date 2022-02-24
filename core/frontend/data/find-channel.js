module.exports = async (path, locals) => {
    const api = require('../services/proxy').api[locals.apiVersion];
    const result = await api.channelsPublic.read({route: path}, {include: 'posts'});
    const channel = result.channels[0];

    return channel;
};
