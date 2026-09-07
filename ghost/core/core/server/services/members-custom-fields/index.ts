import {CustomFieldDefinitionsService} from './definitions-service';
import {CustomFieldValuesService} from './values-service';
import {recordCustomFieldAction, type RecordCustomFieldAction} from './actions';
import {resolveMaxDefinitions} from './config';
import {defineService} from '../../../shared/service-lifecycle';

export type {CustomField} from './models';
export type {RequestContext} from './actions';

// Two services from one module, split along an aggregate boundary rather than a
// technical layer: `definitions` owns the field definitions, which belong to the
// site's settings, and `values` owns the per-member values, which belong to the
// member. The values service reads the definitions table directly for the
// reference data it needs — a value referencing its definition, not a boundary
// crossing.
//
interface MembersCustomFieldsService {
    definitions: CustomFieldDefinitionsService;
    values: CustomFieldValuesService;
}

let instance: MembersCustomFieldsService | undefined;

function create() {
    if (instance) {
        return instance;
    }

    const {knex} = require('../../data/db');
    const models = require('../../models');

    const recordAction: RecordCustomFieldAction = ({context, verb, subject, details}) =>
        recordCustomFieldAction({Action: models.Action, context, verb, subject, details});

    // Resolved here, not in the service: reading config is this module's job, and
    // the service is handed a number. A getter rather than a value because the
    // ceiling is an operator setting that can change between requests, and a Ghost
    // container holds no state across them.
    const config = require('../../../shared/config');

    const definitions = new CustomFieldDefinitionsService({
        knex,
        recordAction,
        getMaxDefinitions: () => resolveMaxDefinitions(config.get('members:customFields:maxDefinitions'))
    });
    // The values service reads the field definitions straight from the table, so
    // it needs knex and the same ceiling — no handle on the definitions service.
    const values = new CustomFieldValuesService({
        knex,
        getMaxDefinitions: () => resolveMaxDefinitions(config.get('members:customFields:maxDefinitions'))
    });
    instance = {definitions, values};

    return instance;
}
const lifecycle = defineService({
    name: 'MembersCustomFieldsService',
    create
});

export const service = lifecycle.service;
export const init = lifecycle.init;
export const shutdown = lifecycle.shutdown;
