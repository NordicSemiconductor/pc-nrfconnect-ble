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

import Immutable, { Record, OrderedMap, List } from 'immutable';
import * as SecurityActions from '../actions/securityActions';
import * as AdapterActions from '../actions/adapterActions';
import * as apiHelper from '../utils/api';
import { logger } from '../logging';

const IO_CAPS_DISPLAY_ONLY = 0;
const IO_CAPS_DISPLAY_YESNO = 1;
const IO_CAPS_KEYBOARD_ONLY = 2;
const IO_CAPS_NONE = 3;
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
        enc: true,   /**< Long Term Key and Master Identification. */
        id: false,    /**< Identity Resolving Key and Identity Address Information. */
        sign: false,  /**< Connection Signature Resolving Key. */
        link: false,  /**< Derive the Link Key from the LTK. */
    },
    kdist_peer: {
        enc: true,   /**< Long Term Key and Master Identification. */
        id: false,    /**< Identity Resolving Key and Identity Address Information. */
        sign: false,  /**< Connection Signature Resolving Key. */
        link: false,  /**< Derive the Link Key from the LTK. */
    },
});

export function getImmutableSecurityParameters(params) {
    return new SecurityParameters(params);
}

const EncryptionInfo = Record({
    ltk: List(),
    lesc: false,
    auth: false,
    ltk_len: 16,
});

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

function authStatus(state, device, params) {
    const newState = state.set('bondStore', state.bondStore.set(device.address, Immutable.fromJS(params.keyset)));
    console.log(`Store bonding information for device ${device.address}: ${JSON.stringify(state.bondStore)}`);
    return newState;
}

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

function deleteConnectionSecurityParameters(state, device) {
    return state.deleteIn(['connectionsSecParameters', device.address]);
}

const initialState = new InitialState();

export default function discovery(state = initialState, action) {
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
