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

import Immutable, { Record } from 'immutable';
import { logger } from 'nrfconnect/core';

import * as SecurityActions from '../actions/securityActions';
import * as AdapterActions from '../actions/adapterActions';

const IO_CAPS_KEYBOARD_DISPLAY = 4;

const SecurityParameters = Record({
    bond: false,
    io_caps: IO_CAPS_KEYBOARD_DISPLAY,
    lesc: false,
    mitm: false,
    oob: false,
    keypress: false,
    min_key_size: 7,
    max_key_size: 16,
    kdist_own: {
        enc: true, /** < Long Term Key and Master Identification. */
        id: false, /** < Identity Resolving Key and Identity Address Information. */
        sign: false, /** < Connection Signature Resolving Key. */
        link: false, /** < Derive the Link Key from the LTK. */
    },
    kdist_peer: {
        enc: true, /** < Long Term Key and Master Identification. */
        id: false, /** < Identity Resolving Key and Identity Address Information. */
        sign: false, /** < Connection Signature Resolving Key. */
        link: false, /** < Derive the Link Key from the LTK. */
    },
});

export function getImmutableSecurityParameters(params) {
    return new SecurityParameters(params);
}

const ConnectionSecurityParameters = Record({
    ownParams: new SecurityParameters(),
    peerParams: new SecurityParameters(),
});

const InitialState = Record({
    securityParams: new SecurityParameters(),
    showingSecurityDialog: false,
    autoAcceptPairing: true,
    bondStore: new Map(),
    connectionsSecParameters: new Map(),
});

function addBondInfo(state, device, params) {
    const newState = state.set('bondStore', state.bondStore.set(device.address, Immutable.fromJS(params.keyset)));
    logger.info(`Storing bond info for device ${device.address}`);
    logger.debug(`Bond info: ${JSON.stringify(state.bondStore)}`);
    return newState;
}

function storeConnectionSecurityParameters(state, device, ownParams, peerParams) {
    let params = state.getIn(['connectionsSecParameters', device.address]);

    if (!params) {
        params = new ConnectionSecurityParameters({
            ownParams,
            peerParams,
        });
    } else {
        if (ownParams !== undefined && ownParams !== null) {
            params = params.set('ownParams', ownParams);
        }

        if (peerParams !== undefined && peerParams !== null) {
            params = params.set('peerParams', peerParams);
        }
    }

    return state.setIn(['connectionsSecParameters', device.address], params);
}

const initialState = new InitialState();

export default function security(state = initialState, action) {
    switch (action.type) {
        case SecurityActions.SECURITY_SET_PARAMS:
            return state.set('securityParams', new SecurityParameters(action.params));
        case SecurityActions.SECURITY_HIDE_DIALOG:
            return state.set('showingSecurityDialog', false);
        case SecurityActions.SECURITY_SHOW_DIALOG:
            return state.set('showingSecurityDialog', true);
        case SecurityActions.SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING:
            return state.set('autoAcceptPairing', !state.autoAcceptPairing);
        case SecurityActions.SECURITY_DELETE_BOND_INFO:
            return state.set('bondStore', new Map());
        case AdapterActions.DEVICE_ADD_BOND_INFO:
            return addBondInfo(state, action.device, action.params);
        case AdapterActions.DEVICE_SECURITY_STORE_PEER_PARAMS:
            return storeConnectionSecurityParameters(state, action.device, null, action.peerParams);
        case AdapterActions.DEVICE_SECURITY_STORE_OWN_PARAMS:
            return storeConnectionSecurityParameters(state, action.device, action.ownParams, null);
        default:
            return state;
    }
}
