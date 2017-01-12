/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
