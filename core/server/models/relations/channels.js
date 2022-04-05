const {sequence} = require('@tryghost/promise');
const nql = require('@nexes/nql');

//  /**
//          * CHANNEL HANDLING
//          */
//         // console.log('Attached channels', this.get('channels'), model.get('channels'));
//         // if (_.isUndefined(this.get('channels')) || !_.isNull(this.get('channels'))) {
//         //     const channelsToSave = [];
//         //     this.set('channels', channelsToSave);
//         // }

//         // console.log('before', model);

//         ops.push(function updateChannels() {
//             console.log('updating channels');
//             ghostBookshelf.model('Channel')
//                 .findAll({columns: ['id', 'filter'], filter: 'active:true+type:automated'})
//                 .then((channels) => {
//                     console.log('after', self.get('channels'));
//                     // const automatedChannels = channels.toJSON();
//                     // const manualChannels = model.get('channels');

//                     // console.log('automated channels', automatedChannels);
//                     // console.log('manual channels', manualChannels);
//                     // for (const channel of automatedChannels) {
//                     //     if (channel.filter) {
//                     //         const filterNQL = nql(channel.filter, {
//                     //             relations: model.filterRelations(options),
//                     //             expansions: model.filterExpansions()
//                     //         });

//                     //         const match = filterNQL.queryJSON(model.toJSON());
//                     //         if (match) {
//                     //             manualChannels.push({id: channel.id});
//                     //         }
//                     //     } else {
//                     //         console.log('all posts!');
//                     //         manualChannels.push({id: channel.id});
//                     //     }
//                     // }

//                     // model.set('channels', manualChannels);
//                     // console.log('will save', model.get('tags'), model.get('channels'));
//                 });
//         });

module.exports.extendModel = function extendModel(Post, Posts, ghostBookshelf) {
    const proto = Post.prototype;

    const Model = Post.extend({
        onSaving: function (model, attrs, options) {
            const ops = [];

            ops.push(function () {
                console.log('doing channel logic');
                return ghostBookshelf
                    .model('Channel')
                    .findAll()
                    .then((result) => {
                        console.log('result', result);
                    })
                    .catch((error) => {
                        console.log('error', error);
                    });
            });

            // ops.push(() => {
            //     console.log('doing channel logic');
            //     return ghostBookshelf.model('Channel')
            //         .findAll({columns: ['id', 'filter'], filter: 'active:true+type:automated'})
            //         .then((channels) => {
            //             console.log('got channels', channels.toJSON());
            //             channels.forEach((channel) => {
            //                 console.log('a channel', channel);
            //             });
            //         })
            //         .catch((error) => {
            //             console.log('eror', error);
            //         });

            //     // const channelsToAdd = [];

            //     // for (const channel of automatedChannels.models) {
            //     //     console.log('channel', channel);
            //     //     if (channel.filter) {
            //     //         const filterNQL = nql(channel.filter, {
            //     //             relations: model.filterRelations(options),
            //     //             expansions: model.filterExpansions()
            //     //         });

            //     //         const match = filterNQL.queryJSON(model.toJSON());
            //     //         if (match) {
            //     //             channelsToAdd.push({id: channel.id});
            //     //         }
            //     //     } else {
            //     //         console.log('all posts!');
            //     //         channelsToAdd.push({id: channel.id});
            //     //     }
            //     // }
            // });

            // ops.push(() => {
            //     console.log('would do channel logic here');

            // });

            return proto.onSaving.call(this, model, attrs, options);
        }
    }, {

    });

    return Model;
};
