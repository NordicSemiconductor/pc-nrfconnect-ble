'use strict';

import { Record, List } from 'immutable';

import * as AdvertisingSetupActions from '../actions/advertisingSetupActions';
import * as AdapterAction from '../actions/adapterActions';
import { logger } from '../logging';

const defaultAdvData = [{
    type: 'Complete local name',
    typeKey: 0,
    typeApi: 'completeLocalName',
    value: 'nRF Connect',
    formattedValue: 'nRF Connect',
    id: 10000, // Random high id to avoid conflict with autoincremented ids
}];

const InitialState = Record({
    advDataEntries: List(defaultAdvData),
    scanResponseEntries: List(),
    tempAdvDataEntries: List(defaultAdvData),
    tempScanRespEntries: List(),
    show: false,
    setAdvdataStatus: '',
});

const initialState = new InitialState();

export default function advertisingSetup(state = initialState, action) {
    switch (action.type) {
        case AdvertisingSetupActions.ADD_ADVDATA_ENTRY:
            return state.update('tempAdvDataEntries', tempAdvDataEntries => tempAdvDataEntries.push(action.entry));

        case AdvertisingSetupActions.ADD_SCANRSP_ENTRY:
            return state.update('tempScanRespEntries', tempScanRespEntries => tempScanRespEntries.push(action.entry));

        case AdvertisingSetupActions.DELETE_ADVDATA_ENTRY:
            return state.update('tempAdvDataEntries', entries => entries.filterNot(entry => entry.id === action.id));

        case AdvertisingSetupActions.DELETE_SCANRSP_ENTRY:
            return state.update('tempScanRespEntries', entries => entries.filterNot(entry => entry.id === action.id));

        case AdvertisingSetupActions.APPLY_CHANGES:
            state = state.set('advDataEntries', state.tempAdvDataEntries);
            state = state.set('scanResponseEntries', state.tempScanRespEntries);
            return state;

        case AdvertisingSetupActions.SHOW_DIALOG:
            return state.set('show', true);

        case AdvertisingSetupActions.HIDE_DIALOG:
            state = state.set('tempAdvDataEntries', List(state.advDataEntries.toArray()));
            state = state.set('tempScanRespEntries', List(state.scanResponseEntries.toArray()));
            state = state.set('show', false);
            return state;

        case AdvertisingSetupActions.SET_ADVDATA_COMPLETED:
            return state.set('setAdvdataStatus', action.status);

        case AdvertisingSetupActions.ADVERTISING_STARTED:
            logger.info('Advertising started');
            return state;

        case AdvertisingSetupActions.ADVERTISING_STOPPED:
            logger.info('Advertising stopped');
            return state;
        case AdapterAction.ADAPTER_RESET_PERFORMED:
            return initialState;
        default:
            return state;
    }
}
