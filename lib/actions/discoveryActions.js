/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

export const DISCOVERY_DEVICE_FOUND = 'DISCOVERY_DEVICE_FOUND';
export const DISCOVERY_CLEAR_LIST = 'DISCOVERY_CLEAR_LIST';
export const DISCOVERY_SCAN_STARTED = 'DISCOVERY_SCAN_STARTED';
export const DISCOVERY_SCAN_STOPPED = 'DISCOVERY_SCAN_STOPPED';
export const DISCOVERY_TOGGLE_EXPANDED = 'DISCOVERY_TOGGLE_EXPANDED';
export const DISCOVERY_TOGGLE_OPTIONS_EXPANDED =
    'DISCOVERY_TOGGLE_OPTIONS_EXPANDED';
export const DISCOVERY_SET_OPTIONS = 'DISCOVERY_SET_OPTIONS';
export const DISCOVERY_ACTIVE_SCAN = 'DISCOVERY_ACTIVE_SCAN';
export const DISCOVERY_SET_TIMEOUT = 'DISCOVERY_SET_TIMEOUT';

export const ERROR_OCCURED = 'ERROR_OCCURED';

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
        deviceAddress,
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

function changeActiveScanAction() {
    return {
        type: DISCOVERY_ACTIVE_SCAN,
    };
}
function setTimeoutChangeAction(value) {
    return {
        type: DISCOVERY_SET_TIMEOUT,
        value,
    };
}

// Internal functions
function startScan(dispatch, getState) {
    new Promise((resolve, reject) => {
        const discoveryOptions = getState().app.discovery.options;
        const scanParameters = {
            active: discoveryOptions.activeScan,
            interval: discoveryOptions.scanInterval,
            window: discoveryOptions.scanWindow,
            timeout: discoveryOptions.scanTimeout,
        };

        const { adapter } = getState().app.adapter.bleDriver;

        if (adapter === null || adapter === undefined) {
            reject(new Error('No adapter is selected.'));
        }

        adapter.startScan(scanParameters, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    })
        .then(() => {
            dispatch(scanStartedAction());
        })
        .catch(error => {
            dispatch(scanErrorAction(error));
        });
}

function stopScan(dispatch, getState) {
    new Promise((resolve, reject) => {
        const { adapter } = getState().app.adapter.bleDriver;

        if (adapter === null) {
            reject(new Error('No adapter is selected.'));
        }

        adapter.stopScan(error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    })
        .then(() => {
            dispatch(scanStoppedAction());
        })
        .catch(error => {
            dispatch(scanErrorAction(error));
        });
}

// Exported action starters
export function clearDevicesList() {
    return dispatch => {
        dispatch(clearDevicesListAction());
    };
}

export function toggleScan() {
    return (dispatch, getState) => {
        const { selectedAdapter } = getState().app.adapter;

        if (selectedAdapter && selectedAdapter.state) {
            if (
                selectedAdapter.state.scanning &&
                selectedAdapter.state.available
            ) {
                stopScan(dispatch, getState);
            } else if (
                !selectedAdapter.state.scanning &&
                selectedAdapter.state.available
            ) {
                startScan(dispatch, getState);
            } else {
                dispatch(
                    scanErrorAction(
                        'scanInProgress and adapterIsOpen is in a combination that makes it impossible to toggle scanning.'
                    )
                );
            }
        } else {
            dispatch(
                scanErrorAction(
                    'No adapter selected or adapter is missing state. Failing.'
                )
            );
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

export function changeActiveScan() {
    return changeActiveScanAction();
}

export function setTimeoutChange(value) {
    return setTimeoutChangeAction(value);
}
