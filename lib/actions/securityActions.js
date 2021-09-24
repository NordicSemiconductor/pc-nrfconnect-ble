/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

export const SECURITY_SET_PARAMS = 'SECURITY_SET_PARAMS';
export const SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING =
    'SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING';
export const SECURITY_DELETE_BOND_INFO = 'SECURITY_DELETE_BOND_INFO';
export const SECURITY_SHOW_DIALOG = 'SECURITY_SHOW_DIALOG';
export const SECURITY_HIDE_DIALOG = 'SECURITY_HIDE_DIALOG';
export const SECURITY_ERROR_OCCURED = 'SECURITY_ERROR_OCCURED';

// Internal functions

// Action object functions
function setSecurityParamsAction(params) {
    return {
        type: SECURITY_SET_PARAMS,
        params,
    };
}

function toggleAutoAcceptPairingAction() {
    return {
        type: SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING,
    };
}

function deleteBondInfoAction() {
    return {
        type: SECURITY_DELETE_BOND_INFO,
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

// Exported action starters
export function setSecurityParams(params) {
    return setSecurityParamsAction(params);
}

export function toggleAutoAcceptPairing() {
    return toggleAutoAcceptPairingAction();
}

export function deleteBondInfo() {
    return deleteBondInfoAction();
}

export function showSecurityParamsDialog() {
    return showSecurityParamsDialogAction();
}

export function hideSecurityParamsDialog() {
    return hideSecurityParamsDialogAction();
}
