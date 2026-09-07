import {GiftLinksService} from './service';
import {recordGiftLinkAction, type RecordGiftLinkAction} from './actions';
import {defineService} from '../../../shared/service-lifecycle';

export type {RequestContext} from './actions';

const lifecycle = defineService({
    name: 'GiftLinksService',
    create() {
        // Knex is only available once boot has connected the database.
        const {knex} = require('../../data/db');
        const models = require('../../models');

        const recordAction: RecordGiftLinkAction = ({context, verb, subject}) =>
            recordGiftLinkAction({Action: models.Action, context, verb, subject});
        return new GiftLinksService({knex, recordAction});
    }
});

export const service = lifecycle.service;
export const init = lifecycle.init;
export const shutdown = lifecycle.shutdown;
