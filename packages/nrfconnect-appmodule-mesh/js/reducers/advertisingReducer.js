/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

 'use strict';

import { Record, List } from 'immutable';

import * as advertisingActions from '../actions/advertisingActions';
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

export default function advertising(state = initialState, action) {
    switch (action.type) {
        case advertisingActions.ADD_ADVDATA_ENTRY:
            return state.set('tempAdvDataEntries', state.tempAdvDataEntries.push(action.entry));
        case advertisingActions.ADD_SCANRSP_ENTRY:
            return state.set('tempScanRespEntries', state.tempScanRespEntries.push(action.entry));
        case advertisingActions.DELETE_ADVDATA_ENTRY:
            return state.set('tempAdvDataEntries', state.tempAdvDataEntries.filterNot(entry => entry.id === action.id));
        case advertisingActions.DELETE_SCANRSP_ENTRY:
            return state.set('tempScanRespEntries', state.tempScanRespEntries.filterNot(entry => entry.id === action.id));
        case advertisingActions.APPLY_CHANGES:
            state = state.set('advDataEntries', state.tempAdvDataEntries);
            state = state.set('scanResponseEntries', state.tempScanRespEntries);
            return state;
        case advertisingActions.SHOW_DIALOG:
            return state.set('show', true);
        case advertisingActions.HIDE_DIALOG:
            state = state.set('tempAdvDataEntries', state.advDataEntries);
            state = state.set('tempScanRespEntries', state.scanResponseEntries);
            state = state.set('show', false);
            return state;
        case advertisingActions.SET_ADVDATA_COMPLETED:
            return state.set('setAdvdataStatus', action.status);
        case advertisingActions.ADVERTISING_STARTED:
            logger.info('Advertising started');
            return state;
        case advertisingActions.ADVERTISING_STOPPED:
            logger.info('Advertising stopped');
            return state;
        case AdapterAction.ADAPTER_RESET_PERFORMED:
            return initialState;
        default:
            return state;
    }
}
