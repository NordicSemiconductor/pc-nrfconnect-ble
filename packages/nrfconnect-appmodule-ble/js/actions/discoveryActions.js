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

import { getSelectedAdapter } from './common';

export const DISCOVERY_DEVICE_FOUND = 'DISCOVERY_DEVICE_FOUND';
export const DISCOVERY_CLEAR_LIST = 'DISCOVERY_CLEAR_LIST';
export const DISCOVERY_SCAN_STARTED = 'DISCOVERY_SCAN_STARTED';
export const DISCOVERY_SCAN_STOPPED = 'DISCOVERY_SCAN_STOPPED';
export const DISCOVERY_TOGGLE_EXPANDED = 'DISCOVERY_TOGGLE_EXPANDED';
export const DISCOVERY_TOGGLE_OPTIONS_EXPANDED = 'DISCOVERY_TOGGLE_OPTIONS_EXPANDED';
export const DISCOVERY_SET_OPTIONS = 'DISCOVERY_SET_OPTIONS';

export const ERROR_OCCURED = 'ERROR_OCCURED';

// Internal functions
function _startScan(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const discoveryOptions = getState().discovery.options;
        const scanParameters = {
            active: discoveryOptions.activeScan,
            interval: discoveryOptions.scanInterval,
            window: discoveryOptions.scanWindow,
            timeout: discoveryOptions.scanTimeout,
        };

        const adapter = getState().adapter.api.selectedAdapter;

        if (adapter === null || adapter === undefined) {
            reject('No adapter is selected.');
        }

        adapter.startScan(scanParameters, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    }).then(() => {
        dispatch(scanStartedAction());
    }).catch(error => {
        dispatch(scanErrorAction(error));
    });
}

function _stopScan(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const adapter = getState().adapter.api.selectedAdapter;

        if (adapter === null) {
            reject('No adapter is selected.');
        }

        adapter.stopScan(error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    }).then(() => {
        dispatch(scanStoppedAction());
    }).catch(error => {
        dispatch(scanErrorAction(error));
    });
}

// Action object functions
function scanErrorAction(error) {
    return {
        type: ERROR_OCCURED,
        error,
    };
}

function clearDevicesListAction() {
    return {
        type: DISCOVERY_CLEAR_LIST,
    };
}

function scanStartedAction() {
    return {
        type: DISCOVERY_SCAN_STARTED,
    };
}

function scanStoppedAction() {
    return {
        type: DISCOVERY_SCAN_STOPPED,
    };
}

function toggleExpandedAction(deviceAddress) {
    return {
        type: DISCOVERY_TOGGLE_EXPANDED,
        deviceAddress: deviceAddress,
    };
}

function toggleOptionsExpandedAction() {
    return {
        type: DISCOVERY_TOGGLE_OPTIONS_EXPANDED,
    };
}

function setDiscoveryOptionsAction(options) {
    return {
        type: DISCOVERY_SET_OPTIONS,
        options,
    };
}

// Exported action starters
export function clearDevicesList() {
    return dispatch => {
        dispatch(clearDevicesListAction());
    };
}

export function toggleScan() {
    return (dispatch, getState) => {
        const selectedAdapter = getSelectedAdapter(getState());

        if (selectedAdapter && selectedAdapter.state) {
            if (selectedAdapter.state.scanning && selectedAdapter.state.available) {
                return _stopScan(dispatch, getState);
            } else if (!selectedAdapter.state.scanning && selectedAdapter.state.available)  {
                return _startScan(dispatch, getState);
            } else {
                dispatch(scanErrorAction('scanInProgress and adapterIsOpen is in a combination that makes it impossible to toggle scanning.'));
            }
        } else {
            dispatch(scanErrorAction('No adapter selected or adapter is missing state. Failing.'));
        }
    };
}

export function toggleExpanded(deviceAddress) {
    return toggleExpandedAction(deviceAddress);
}

export function toggleOptionsExpanded() {
    return toggleOptionsExpandedAction();
}

export function setDiscoveryOptions(options) {
    return setDiscoveryOptionsAction(options);
}