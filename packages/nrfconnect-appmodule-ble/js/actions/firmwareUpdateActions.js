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

import os from 'os';
import { remote } from 'electron';
import { openAdapter } from './adapterActions';
import { DebugProbe } from 'pc-nrfjprog-js';
import { showErrorDialog } from './errorDialogActions';

function _updateFirmware(dispatch, getState, adapter) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.adapters.find(x => { return x.state.port === adapter; });

        if (adapterToUse === null) {
            reject(new Error(`Not able to find ${adapter}.`));
        }

        _loadFirmwareDefinitions()
            .then(firmwareDefinitions => {
                const serialNumber = parseInt(adapterToUse.state.serialNumber, 10);
                const probe = new DebugProbe();
                probe.program(serialNumber, firmwareDefinitions, err => {
                    if (err) {
                        reject(new Error('Not able to program. Error: ' + err));
                    } else {
                        resolve();
                    }
                });
            });
    }).then(() => {
        dispatch(hideFirmwareUpdateRequestAction());
        setTimeout(() => dispatch(openAdapter(adapter)), 1000);
    }).catch(error => {
        dispatch(hideFirmwareUpdateRequestAction());
        dispatch(showErrorDialog(error));
    });
}

function _loadFirmwareDefinitions() {
    return new Promise(resolve => {
        // Using webpack code splitting to create a separate bundle, so that firmware
        // data can be loaded on demand.
        require.ensure(['../utils/firmwareDefinitions'], function (require) {
            const definitions = require('../utils/firmwareDefinitions');
            if (os.type() === 'Darwin') {
                resolve(definitions.firmwareDefinitions115k2);
            } else {
                resolve(definitions.firmwareDefinitions1m);
            }
        }, 'firmware');
    });
}

function showFirmwareUpdateRequestAction(adapter, foundVersion, latestVersion) {
    return {
        type: SHOW_FIRMWARE_UPDATE_REQUEST,
        adapter,
        foundVersion,
        latestVersion,
    };
}

function hideFirmwareUpdateRequestAction() {
    return {
        type: HIDE_FIRMWARE_UPDATE_REQUEST,
    };
}

function showUpdateFirmwareSpinnerAction() {
    return {
        type: SHOW_FIRMWARE_UPDATE_SPINNER,
    };
}

export function showFirmwareUpdateRequest(adapter, foundVersion, latestVersion) {
    return showFirmwareUpdateRequestAction(adapter, foundVersion, latestVersion);
}

export function updateFirmware() {
    return ((dispatch, getState) => {
        const adapter = getState().firmwareUpdate.adapter;
        dispatch(showUpdateFirmwareSpinnerAction());
        _updateFirmware(dispatch, getState, adapter);
    });
}

export function continueOpenDevice() {
    return ((dispatch, getState) => {
        const adapter = getState().firmwareUpdate.adapter;
        dispatch(hideFirmwareUpdateRequestAction());
        dispatch(openAdapter(adapter));
    });
}
