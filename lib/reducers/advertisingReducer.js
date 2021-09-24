/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import { List, Record } from 'immutable';
import { logger } from 'nrfconnect/core';

import * as AdapterAction from '../actions/adapterActions';
import * as advertisingActions from '../actions/advertisingActions';
import { persistentStore } from '../common/Persistentstore';

const defaultAdvData = [
    {
        type: 'Complete local name',
        typeKey: 0,
        typeApi: 'completeLocalName',
        value: 'nRF Connect',
        formattedValue: 'nRF Connect',
        id: 10000, // Random high id to avoid conflict with autoincremented ids
    },
];

const storedScanResponseEntries = () => {
    return persistentStore.scanResponse();
};
const advDataEntries = () => {
    const storedAdvEntries = persistentStore.advSetup();
    return storedAdvEntries.length === 0 ? defaultAdvData : storedAdvEntries;
};

const getInitialState = () =>
    new Record({
        advDataEntries: List(advDataEntries()),
        scanResponseEntries: List(storedScanResponseEntries()),
        tempAdvDataEntries: List(advDataEntries()),
        tempScanRespEntries: List(storedScanResponseEntries()),
        show: false,
        setAdvdataStatus: '',
        showAdvParams: false,
        advParams: persistentStore.advParams(),
    })();

export default function advertising(state = getInitialState(), action) {
    switch (action.type) {
        case advertisingActions.ADD_ADVDATA_ENTRY:
            return state.set(
                'tempAdvDataEntries',
                state.tempAdvDataEntries.push(action.entry)
            );
        case advertisingActions.ADD_SCANRSP_ENTRY:
            return state.set(
                'tempScanRespEntries',
                state.tempScanRespEntries.push(action.entry)
            );
        case advertisingActions.DELETE_ADVDATA_ENTRY:
            return state.set(
                'tempAdvDataEntries',
                state.tempAdvDataEntries.filterNot(
                    entry => entry.id === action.id
                )
            );
        case advertisingActions.DELETE_SCANRSP_ENTRY:
            return state.set(
                'tempScanRespEntries',
                state.tempScanRespEntries.filterNot(
                    entry => entry.id === action.id
                )
            );
        case advertisingActions.APPLY_CHANGES:
            persistentStore.setAdvSetup(state.tempAdvDataEntries);
            persistentStore.setScanResponse(state.tempScanRespEntries);
            return state
                .set('advDataEntries', state.tempAdvDataEntries)
                .set('scanResponseEntries', state.tempScanRespEntries);
        case advertisingActions.SHOW_DIALOG:
            return state.set('show', true);
        case advertisingActions.HIDE_DIALOG:
            return state
                .set('tempAdvDataEntries', state.advDataEntries)
                .set('tempScanRespEntries', state.scanResponseEntries)
                .set('show', false)
                .set('showAdvParams', false);
        case advertisingActions.SET_ADVDATA_COMPLETED:
            return state.set('setAdvdataStatus', action.status);
        case advertisingActions.ADVERTISING_STARTED:
            logger.info('Advertising started');
            return state;
        case advertisingActions.ADVERTISING_STOPPED:
            logger.info('Advertising stopped');
            return state;
        case AdapterAction.ADAPTER_RESET_PERFORMED:
            return getInitialState();
        case advertisingActions.LOAD:
            return state
                .set('tempAdvDataEntries', List(action.advSetup))
                .set('tempScanRespEntries', List(action.scanSetup));
        case advertisingActions.SHOW_ADV_PARAMS:
            return state.set('showAdvParams', true);
        case advertisingActions.SET_ADVERTISING_PARAMS:
            persistentStore.setAdvParams(action.params);
            return state.set('advParams', action.params);
        default:
            return state;
    }
}
