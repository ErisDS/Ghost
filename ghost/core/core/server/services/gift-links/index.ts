import {GiftLinksService} from './service';
import {recordGiftLinkAction, type RecordGiftLinkAction} from './actions';
import {lazySingleton} from '../../../shared/lazy-singleton';

export type {RequestContext} from './actions';

// Constructed by init() at boot, not at import: knex is only available once the DB has connected.
let instance: GiftLinksService | undefined;

export const service = lazySingleton('GiftLinksService', () => instance);

export function init(): void {
    if (instance) {
        return;
    }

    const {knex} = require('../../data/db');
    const models = require('../../models');

    const recordAction: RecordGiftLinkAction = ({context, verb, subject}) =>
        recordGiftLinkAction({Action: models.Action, context, verb, subject});
    instance = new GiftLinksService({knex, recordAction});
}
