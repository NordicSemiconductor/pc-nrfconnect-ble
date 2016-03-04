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

export const SECURITY_SET_PARAMS = 'SECURITY_SET_PARAMS';
export const SECURITY_SET_PARAMS_COMPLETED = 'SECURITY_SET_PARAMS_COMPLETED';
export const SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING = 'SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING';
export const SECURITY_SHOW_DIALOG = 'SECURITY_SHOW_DIALOG';
export const SECURITY_HIDE_DIALOG = 'SECURITY_HIDE_DIALOG';
export const SECURITY_ERROR_OCCURED = 'SECURITY_ERROR_OCCURED';

// Internal functions
function _setSecurityParams(dispatch, getState, params) {
    const adapter = getState().adapter.api.selectedAdapter;
    const security = getState().security;

    return new Promise((resolve, reject) => {
        if (!adapter) {
            reject('No adapter is selected');
        }

        adapter.setSecurityParams(params, error => {
            if (error) {
                reject(error);
            } else {
                dispatch(setSecurityParamsCompletedAction(params));
                resolve();
            }
        });
    }).catch(error => {
        dispatch(securityErrorOccuredAction(error.message));
    });
}

// Action object functions
function setSecurityParamsCompletedAction(params) {
    return {
        type: SECURITY_SET_PARAMS_COMPLETED,
        params: params,
    };
}

function toggleAutoAcceptPairingAction() {
    return {
        type: SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING,
    };
}

function showSecurityParamsDialogAction() {
    return {
        type: SECURITY_SHOW_DIALOG,
    };
}

function hideSecurityParamsDialogAction() {
    return {
        type: SECURITY_HIDE_DIALOG,
    };
}

function securityErrorOccuredAction(error) {
    return {
        type: SECURITY_ERROR_OCCURED,
        error: error,
    };
}

// Exported action starters
export function setSecurityParams(params) {
    return (dispatch, getState) => {
        _setSecurityParams(dispatch, getState, params);
    };
}

export function toggleAutoAcceptPairing() {
    return toggleAutoAcceptPairingAction();
}

export function showSecurityParamsDialog() {
    return showSecurityParamsDialogAction();
}

export function hideSecurityParamsDialog() {
    return hideSecurityParamsDialogAction();
}
