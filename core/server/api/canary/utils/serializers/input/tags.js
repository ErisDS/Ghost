const debug = require('ghost-ignition').debug('api:canary:utils:serializers:input:tags');
const url = require('./utils/url');
const utils = require('../../index');

function setDefaultOrder(frame) {
    let defaultOrder = 'name asc';

    if (!frame.options.order && frame.options.filter) {
        let orderMatch = frame.options.filter.match(/slug:\s?\[(.*)\]/);

        if (orderMatch) {
            let orderStuff = orderMatch[1].split(',');
            let order = 'CASE ';

            orderStuff.forEach((item, index) => {
                order += `WHEN slug = '${item}' THEN ${index} `;
            });

            order += 'END ASC';

            frame.options.orderRaw = order;
        }
    }

    if (!frame.options.order && !frame.options.orderRaw) {
        frame.options.order = defaultOrder;
    }
}

module.exports = {
    browse(apiConfig, frame) {
        debug('browse');

        if (utils.isContentAPI(frame)) {
            setDefaultOrder(frame);
        }
    },

    read() {
        debug('read');

        this.browse(...arguments);
    },

    add(apiConfig, frame) {
        debug('add');
        frame.data.tags[0] = url.forTag(Object.assign({}, frame.data.tags[0]));
    },

    edit(apiConfig, frame) {
        debug('edit');
        this.add(apiConfig, frame);
    }
};
