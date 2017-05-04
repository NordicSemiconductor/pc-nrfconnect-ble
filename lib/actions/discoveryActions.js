/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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

        const adapter = getState().app.adapter.api.selectedAdapter;

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

function stopScan(dispatch, getState) {
    new Promise((resolve, reject) => {
        const adapter = getState().app.adapter.api.selectedAdapter;

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

// Exported action starters
export function clearDevicesList() {
    return dispatch => {
        dispatch(clearDevicesListAction());
    };
}

export function toggleScan() {
    return ((dispatch, getState) => {
        const selectedAdapter = getSelectedAdapter(getState());

        if (selectedAdapter && selectedAdapter.state) {
            if (selectedAdapter.state.scanning && selectedAdapter.state.available) {
                stopScan(dispatch, getState);
            } else if (!selectedAdapter.state.scanning && selectedAdapter.state.available) {
                startScan(dispatch, getState);
            } else {
                dispatch(scanErrorAction('scanInProgress and adapterIsOpen is in a combination that makes it impossible to toggle scanning.'));
            }
        } else {
            dispatch(scanErrorAction('No adapter selected or adapter is missing state. Failing.'));
        }
    });
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
