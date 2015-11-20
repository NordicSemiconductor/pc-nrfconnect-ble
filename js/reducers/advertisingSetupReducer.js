'use strict';

import { Record, List } from 'immutable';

import * as AdvertisingSetupActions from '../actions/advertisingSetupActions';

const InitialState = Record({
    advDataEntries: List(),
    scanResponseEntries: List(),
    show: false,
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
            return state.update('show', show => true);

        case AdvertisingSetupActions.HIDE_DIALOG:
            return state.update('show', show => false);

        default:
            return state;
    }
}
