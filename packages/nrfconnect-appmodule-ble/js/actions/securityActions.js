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

import { getSelectedAdapter } from './common';

export const SECURITY_SET_PARAMS = 'SECURITY_SET_PARAMS';
export const SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING = 'SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING';
export const SECURITY_DELETE_BOND_INFO = 'SECURITY_DELETE_BOND_INFO';
export const SECURITY_SHOW_DIALOG = 'SECURITY_SHOW_DIALOG';
export const SECURITY_HIDE_DIALOG = 'SECURITY_HIDE_DIALOG';
export const SECURITY_ERROR_OCCURED = 'SECURITY_ERROR_OCCURED';

// Internal functions

// Action object functions
function setSecurityParamsAction(params) {
    return {
        type: SECURITY_SET_PARAMS,
        params: params,
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

function securityErrorOccuredAction(error) {
    return {
        type: SECURITY_ERROR_OCCURED,
        error: error,
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
