'use strict';

import { Record, List } from 'immutable';

import * as AdvertisingSetupActions from '../actions/advertisingSetupActions';
import { logger } from '../logging';

const InitialState = Record({
    advDataEntries: List([{ // Default advertising data
        type: 'Complete local name',
        typeKey: 0,
        typeApi: 'completeLocalName',
        value: 'Yggdrasil',
        formattedValue: 'Yggdrasil',
        id: 10000, // Random high id to avoid conflict with autoincremented ids
    }]),
    scanResponseEntries: List(),
    show: false,
    setAdvdataStatus: '',
});

const initialState = new InitialState();

export default function advertisingSetup(state = initialState, action) {
    switch (action.type) {
        case AdvertisingSetupActions.ADD_ADVDATA_ENTRY:
            return state.update('advDataEntries', advDataEntries => advDataEntries.push(action.entry));

        case AdvertisingSetupActions.DELETE_ADVDATA_ENTRY:
            return state.update('advDataEntries', advDataEntries => advDataEntries.filterNot(entry => entry.id === action.id));

        case AdvertisingSetupActions.ADD_SCANRSP_ENTRY:
            return state.update('scanResponseEntries', scanResponseEntries => scanResponseEntries.push(action.entry));

        case AdvertisingSetupActions.DELETE_SCANRSP_ENTRY:
            return state.update('scanResponseEntries', scanResponseEntries => scanResponseEntries.filterNot(entry => entry.id === action.id));

        case AdvertisingSetupActions.SHOW_DIALOG:
            return state.set('show', true);

        case AdvertisingSetupActions.HIDE_DIALOG:
            return state.set('show', false);

        case AdvertisingSetupActions.SET_ADVDATA_COMPLETED:
            return state.set('setAdvdataStatus', action.status);

        case AdvertisingSetupActions.ADVERTISING_STARTED:
            logger.info('Advertising started');
            return state;

        case AdvertisingSetupActions.ADVERTISING_STOPPED:
            logger.info('Advertising stopped');
            return state;

        default:
            return state;
    }
}
