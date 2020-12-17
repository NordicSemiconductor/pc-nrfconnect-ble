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

/* eslint no-use-before-define: off */
import { logger } from 'nrfconnect/core';
import { writeFile, readFileSync } from 'fs';
import { showErrorDialog } from './errorDialogActions';

export const ADD_ADVDATA_ENTRY = 'ADVSETUP_ADD_ADVDATA_ENTRY';
export const ADD_SCANRSP_ENTRY = 'ADVSETUP_ADD_SCANRSP_ENTRY';
export const DELETE_ADVDATA_ENTRY = 'ADVSETUP_DELETE_ADVDATA_ENTRY';
export const DELETE_SCANRSP_ENTRY = 'ADVSETUP_DELETE_SCANRSP_ENTRY';
export const SHOW_DIALOG = 'ADVSETUP_SHOW_DIALOG';
export const HIDE_DIALOG = 'ADVSETUP_HIDE_DIALOG';
export const APPLY_CHANGES = 'ADVSETUP_APPLY_CHANGES';
export const SET_ADVDATA = 'ADVSETUP_SET_ADVDATA';
export const SET_ADVDATA_COMPLETED = 'ADVSETUP_SET_ADVDATA_COMPLETED';
export const ADVERTISING_STARTED = 'ADVSETUP_ADVERTISING_STARTED';
export const ADVERTISING_STOPPED = 'ADVSETUP_ADVERTISING_STOPPED';
export const ERROR_OCCURED = 'ADVSETUP_ERROR_OCCURED';
export const LOAD = 'LOAD';
export const SHOW_ADV_PARAMS = 'SHOW_ADV_PARAMS';
export const SET_ADVERTISING_PARAMS = 'SET_ADVERTISING_PARAMS';

// Internal functions
function setAdapterAdvertisingData(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const { adapter } = getState().app.adapter.bleDriver;
        const { advertising } = getState().app;
        const advData = {};
        const scanResp = {};

        if (adapter === null || adapter === undefined) {
            reject(new Error('No adapter is selected.'));
        }

        advertising.advDataEntries.forEach((entry, i) => {
            const key = entry.typeApi.replace('custom', `custom:${i}`);
            advData[key] = entry.formattedValue;
        });

        advertising.scanResponseEntries.forEach((entry, i) => {
            const key = entry.typeApi.replace('custom', `custom:${i}`);
            scanResp[key] = entry.formattedValue;
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

function startAdvertising(dispatch, getState) {
    const { adapter } = getState().app.adapter.bleDriver;
    const { advParams } = getState().app.advertising;

    return setAdapterAdvertisingData(dispatch, getState)
        .then(
            () =>
                new Promise((resolve, reject) => {
                    const options = {
                        interval: advParams.interval,
                        timeout: advParams.timeout,
                    };
                    if (adapter === null || adapter === undefined) {
                        reject(new Error('No adapter is selected.'));
                    }

                    adapter.startAdvertising(options, error => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                })
        )
        .then(() => {
            dispatch(advertisingStartedAction());
        })
        .catch(error => {
            dispatch(advertisingErrorAction(error));
        });
}

function stopAdvertising(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const { adapter } = getState().app.adapter.bleDriver;

        if (adapter === null) {
            reject(new Error('No adapter is selected.'));
        }

        adapter.stopAdvertising(error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    })
        .then(() => {
            dispatch(advertisingStoppedAction());
        })
        .catch(error => {
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

function applyChangesAction() {
    return {
        type: APPLY_CHANGES,
    };
}

function setAdvertisingCompletedAction(status) {
    return {
        type: SET_ADVDATA_COMPLETED,
        status,
    };
}

function advertisingStartedAction() {
    return {
        type: ADVERTISING_STARTED,
    };
}

function advertisingStoppedAction() {
    return {
        type: ADVERTISING_STOPPED,
    };
}

function loadAction(advSetup, scanSetup) {
    return {
        type: LOAD,
        advSetup,
        scanSetup,
    };
}

function showAdvertisingParams() {
    return {
        type: SHOW_ADV_PARAMS,
    };
}
function setAdvParamsAction(params) {
    return {
        type: SET_ADVERTISING_PARAMS,
        params,
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

export function showSetupDialog() {
    return showDialogAction();
}

export function hideSetupDialog() {
    return hideDialogAction();
}

export function applyChanges() {
    return applyChangesAction();
}

export function setAdvertisingData() {
    return (dispatch, getState) => {
        const { selectedAdapter } = getState().app.adapter;

        if (selectedAdapter.state) {
            if (selectedAdapter.state.available) {
                return setAdapterAdvertisingData(dispatch, getState);
            }
            return Promise.reject(
                new Error(
                    'adapter is not available, cannot set advertising data'
                )
            );
        }
        return Promise.reject(
            new Error(
                'No adapter selected, or adapter is missing state. Failing.'
            )
        );
    };
}

export function toggleAdvertising() {
    return (dispatch, getState) => {
        const { selectedAdapter } = getState().app.adapter;

        if (selectedAdapter.state) {
            if (
                selectedAdapter.state.advertising &&
                selectedAdapter.state.available
            ) {
                return stopAdvertising(dispatch, getState);
            }
            if (
                !selectedAdapter.state.advertising &&
                selectedAdapter.state.available
            ) {
                return startAdvertising(dispatch, getState);
            }
            return Promise.reject(
                new Error(
                    'advertisingInProgress and adapterIsOpen is' +
                        ' in a combination that makes it impossible to toggle advertising.'
                )
            );
        }
        return Promise.reject(
            new Error(
                'No adapter selected, or adapter is missing state. Failing.'
            )
        );
    };
}
export function saveAdvSetup(filename) {
    return (dispatch, getState) => {
        if (filename) {
            const {
                tempAdvDataEntries,
                tempScanRespEntries,
            } = getState().app.advertising;
            const input = {
                advertisingData: tempAdvDataEntries,
                scanResponse: tempScanRespEntries,
            };
            writeFile(filename, JSON.stringify(input), error => {
                if (error) {
                    dispatch(showErrorDialog(error));
                }
            });
        }
    };
}

export function loadAdvSetup(filename) {
    return dispatch => {
        try {
            const setup = readFileSync(filename);
            const { advertisingData, scanResponse } = JSON.parse(setup);

            if (!advertisingData && !scanResponse) {
                throw new Error('Illegal format on advertising  setup file.');
            }
            dispatch(loadAction(advertisingData, scanResponse));
            logger.info(`Advertising setup loaded from ${filename}.`);
        } catch (e) {
            dispatch(showErrorDialog(e));
        }
    };
}

export function showParamsDialog() {
    return showAdvertisingParams();
}
export function hideAdvParamDialog() {
    return hideDialogAction();
}
export function setAdvParams(params) {
    return setAdvParamsAction(params);
}
