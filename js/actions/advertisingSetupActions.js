/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

import { getSelectedAdapter } from './common';
import { discoverServices } from './deviceDetailsActions';
import { connectedToDevice } from './adapterActions';

export const ADD_ADVDATA_ENTRY = 'ADVSETUP_ADD_ADVDATA_ENTRY';
export const ADD_SCANRSP_ENTRY = 'ADVSETUP_ADD_SCANRSP_ENTRY';
export const DELETE_ADVDATA_ENTRY = 'ADVSETUP_DELETE_ADVDATA_ENTRY';
export const DELETE_SCANRSP_ENTRY = 'ADVSETUP_DELETE_SCANRSP_ENTRY';
export const SHOW_DIALOG = 'ADVSETUP_SHOW_DIALOG';
export const HIDE_DIALOG = 'ADVSETUP_HIDE_DIALOG';
export const ERROR_OCCURED = 'ADVSETUP_ERROR_OCCURED';
export const SET_ADVDATA = 'ADVSETUP_SET_ADVDATA';
export const SET_ADVDATA_COMPLETED = 'ADVSETUP_SET_ADVDATA_COMPLETED';

// Internal functions
function _setAdvertisingData(advertisingSetup, dispatch, getState) {
    const adapter = getState().adapter.api.selectedAdapter;

    return new Promise((resolve, reject) => {
        const advData = {};
        const scanResp = {};

        if (adapter === null || adapter === undefined) {
            reject('No adapter is selected.');
        }

        // TODO: Improve this
        advertisingSetup.advDataEntries.forEach(entry => {
            if (entry.typeApi.toLowerCase().indexOf('uuid') > -1) {
                advData[entry.typeApi] = entry.value.replace(' ', '').split(',');
            } else if (entry.typeApi.toLowerCase().indexOf('power') > -1) {
                advData[entry.typeApi] = parseInt(entry.value);
            } else {
                advData[entry.typeApi] = entry.value;
            }
        });

        advertisingSetup.scanResponseEntries.forEach(entry => {
            if (entry.typeApi.toLowerCase().indexOf('uuid') > -1) {
                scanResp[entry.typeApi] = entry.value.replace(' ', '').split(',');
            } else if (entry.typeApi.toLowerCase().indexOf('power') > -1) {
                scanResp[entry.typeApi] = parseInt(entry.value);
            } else {
                scanResp[entry.typeApi] = entry.value;
            }
        });

        adapter.setAdvertisingData(advData, scanResp, error => {
            if (error) {
                dispatch(setAdvertisingCompletedAction(error.message));
                reject(error);
            } else {
                dispatch(setAdvertisingCompletedAction(''));
                resolve();
            }
        });
    }).catch(error => {
        dispatch(setAdvertisingCompletedAction(error.message));
    });
}

function _startAdvertising(dispatch, getState) {
    const adapter = getState().adapter.api.selectedAdapter;

    return new Promise((resolve, reject) => {
        const advData = {};
        const scanResp = {};
        const options = {
            interval: 25,
            timeout: 0,
        };

        if (adapter === null || adapter === undefined) {
            reject('No adapter is selected.');
        }

        adapter.startAdvertising(options, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    }).catch(error => {
        dispatch(advertisingErrorAction(error));
    });
}

function _stopAdvertising(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const adapter = getState().adapter.api.selectedAdapter;

        if (adapter === null) {
            reject('No adapter is selected.');
        }

        adapter.stopAdvertising(error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    }).catch(error => {
        dispatch(advertisingErrorAction(error));
    });
}

// Action object functions
function advertisingErrorAction(error) {
    return {
        type: ERROR_OCCURED,
        error,
    };
}

function addAdvEntryAction(entry) {
    return {
        type: ADD_ADVDATA_ENTRY,
        entry,
    };
}

function addScanRspAction(entry) {
    return {
        type: ADD_SCANRSP_ENTRY,
        entry,
    };
}

function deleteAdvDataAction(id) {
    return {
        type: DELETE_ADVDATA_ENTRY,
        id,
    };
}

function deleteScanRspAction(id) {
    return {
        type: DELETE_SCANRSP_ENTRY,
        id,
    };
}

function showDialogAction() {
    return {
        type: SHOW_DIALOG,
    };
}

function hideDialogAction() {
    return {
        type: HIDE_DIALOG,
    };
}

function setAdvertisingCompletedAction(status) {
    return {
        type: SET_ADVDATA_COMPLETED,
        status,
    };
}

// Exported action starters
export function addAdvEntry(entry) {
    return addAdvEntryAction(entry);
}

export function deleteAdvData(id) {
    return deleteAdvDataAction(id);
}

export function addScanRsp(entry) {
    return addScanRspAction(entry);
}

export function deleteScanRsp(id) {
    return deleteScanRspAction(id);
}

export function showDialog() {
    return showDialogAction();
}

export function hideDialog() {
    return hideDialogAction();
}

export function setAdvertisingData(advertisingSetup) {
    return (dispatch, getState) => {
        const selectedAdapter = getSelectedAdapter(getState());

        if (selectedAdapter.state) {
            if (selectedAdapter.state.available) {
                return _setAdvertisingData(advertisingSetup, dispatch, getState);
            } else {
                return Promise.reject('adapter is not available, cannot set advertising data');
            }
        } else {
            return Promise.reject('No adapter selected, or adapter is missing state. Failing.');
        }
    };
}

export function toggleAdvertising() {
    return (dispatch, getState) => {
        const selectedAdapter = getSelectedAdapter(getState());

        if (selectedAdapter.state) {
            if (selectedAdapter.state.advertising && selectedAdapter.state.available) {
                return _stopAdvertising(dispatch, getState);
            } else if (!selectedAdapter.state.advertising && selectedAdapter.state.available) {
                return _startAdvertising(dispatch, getState);
            } else {
                return Promise.reject('advertisingInProgress and adapterIsOpen is in a combination that makes it impossible to toggle advertising.');
            }
        } else {
            return Promise.reject('No adapter selected, or adapter is missing state. Failing.');
        }
    };
}

