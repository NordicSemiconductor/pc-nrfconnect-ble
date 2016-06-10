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

export const SHOW_FIRMWARE_UPDATE_REQUEST = 'SHOW_FIRMWARE_UPDATE_REQUEST';
export const HIDE_FIRMWARE_UPDATE_REQUEST = 'HIDE_FIRMWARE_UPDATE_REQUEST';
export const UPDATE_FIRMWARE = 'UPDATE_FIRMWARE';
export const SHOW_FIRMWARE_UPDATE_SPINNER = 'SHOW_FIRMWARE_UPDATE_SPINNER';

import { openAdapter } from './adapterActions';
import { DebugProbe } from 'pc-nrfjprog-js';
import { showErrorDialog } from './errorDialogActions';

function showFirmwareUpdateRequestAction(adapter) {
    return {
        type: SHOW_FIRMWARE_UPDATE_REQUEST,
        adapter,
    };
}

function hideFirmwareUpdateRequestAction() {
    return {
        type: HIDE_FIRMWARE_UPDATE_REQUEST,
    };
}

function updateFirmwareAction(dispatch, getState, adapter) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.adapters.find(x => { return x.state.port === adapter; });

        if (adapterToUse === null) {
            reject(new Error(`Not able to find ${adapter}.`));
        }

        const probe = new DebugProbe();

        probe.program(parseInt(adapterToUse.state.serialNumber, 10), ['./hex/connectivity_115k2_with_s130_2.0.1.hex', './hex/connectivity_115k2_with_s132_2.0.1.hex'], (err, version) => {
            console.log(err);
            console.log(version);

            if (err) {
                reject(new Error('Not able to program.'));
            } else {
                resolve();
            }
        });
    }).then(() => {
        dispatch(hideFirmwareUpdateRequestAction());
        setTimeout(() => dispatch(openAdapter(adapter)), 1000);
    }).catch(error => {
        dispatch(hideFirmwareUpdateRequestAction());
        dispatch(showErrorDialog(error));
    });
}

function showUpdateFirmwareSpinner() {
    return {
        type: SHOW_FIRMWARE_UPDATE_SPINNER,
    };
}

export function showFirmwareUpdateRequest(adapter) {
    return showFirmwareUpdateRequestAction(adapter);
}

export function updateFirmware() {
    return ((dispatch, getState) => {
        const adapter = getState().firmwareUpdate.adapter;
        dispatch(showUpdateFirmwareSpinner());
        updateFirmwareAction(dispatch, getState, adapter);
    });
}

export function continueOpenDevice() {
    return ((dispatch, getState) => {
        const adapter = getState().firmwareUpdate.adapter;
        dispatch(hideFirmwareUpdateRequestAction());
        dispatch(openAdapter(adapter));
    });
}
