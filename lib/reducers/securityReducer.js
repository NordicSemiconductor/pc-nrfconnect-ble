/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import Immutable, { Map, Record } from 'immutable';
import { logger } from 'pc-nrfconnect-shared';

import * as AdapterActions from '../actions/adapterActions';
import * as SecurityActions from '../actions/securityActions';
import { persistentStore } from '../common/Persistentstore';

const IO_CAPS_KEYBOARD_DISPLAY = 4;

const securityParamDefaults = {
    bond: false,
    io_caps: IO_CAPS_KEYBOARD_DISPLAY,
    lesc: false,
    mitm: false,
    oob: false,
    keypress: false,
    io_caps_title: '',
};

const connectionSecurityParametersDefault = {
    min_key_size: 7,
    max_key_size: 16,
    kdist_own: {
        enc: true /** < Long Term Key and Master Identification. */,
        id: false /** < Identity Resolving Key and Identity Address Information. */,
        sign: false /** < Connection Signature Resolving Key. */,
        link: false /** < Derive the Link Key from the LTK. */,
    },
    kdist_peer: {
        enc: true /** < Long Term Key and Master Identification. */,
        id: false /** < Identity Resolving Key and Identity Address Information. */,
        sign: false /** < Connection Signature Resolving Key. */,
        link: false /** < Derive the Link Key from the LTK. */,
    },
};

const getInitialSecurityParams = params =>
    new Record(
        persistentStore.secParams({
            ...securityParamDefaults,
            ...connectionSecurityParametersDefault,
        })
    )(params);

export function getImmutableSecurityParameters(params) {
    return getInitialSecurityParams(params);
}

const ConnectionSecurityParameters = Record({
    ownParams: getInitialSecurityParams(),
    peerParams: getInitialSecurityParams(),
});

const getInitialState = () =>
    new Record({
        securityParams: getInitialSecurityParams(),
        showingSecurityDialog: false,
        autoAcceptPairing: persistentStore.autoAcceptPairing(),
        bondStore: new Map(),
        connectionsSecParameters: new Map(),
    })();

function addBondInfo(state, device, params) {
    const newState = state.set(
        'bondStore',
        state.bondStore.set(device.address, Immutable.fromJS(params.keyset))
    );
    logger.info(`Storing bond info for device ${device.address}`);
    logger.debug(`Bond info: ${JSON.stringify(state.bondStore)}`);
    return newState;
}

function setSecurityParams(state, params) {
    persistentStore.setSecParams(params);
    return state.set('securityParams', getInitialSecurityParams(params));
}

function setAutoAcceptPairing(state) {
    persistentStore.setAutoAcceptPairing(!state.autoAcceptPairing);
    return state.set('autoAcceptPairing', !state.autoAcceptPairing);
}

function storeConnectionSecurityParameters(
    state,
    device,
    ownParams,
    peerParams
) {
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

export default function security(state = getInitialState(), action) {
    switch (action.type) {
        case SecurityActions.SECURITY_SET_PARAMS:
            return setSecurityParams(state, action.params);
        case SecurityActions.SECURITY_HIDE_DIALOG:
            return state.set('showingSecurityDialog', false);
        case SecurityActions.SECURITY_SHOW_DIALOG:
            return state.set('showingSecurityDialog', true);
        case SecurityActions.SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING:
            return setAutoAcceptPairing(state);
        case SecurityActions.SECURITY_DELETE_BOND_INFO:
            return state.set('bondStore', new Map());
        case AdapterActions.DEVICE_ADD_BOND_INFO:
            return addBondInfo(state, action.device, action.params);
        case AdapterActions.DEVICE_SECURITY_STORE_PEER_PARAMS:
            return storeConnectionSecurityParameters(
                state,
                action.device,
                null,
                action.peerParams
            );
        case AdapterActions.DEVICE_SECURITY_STORE_OWN_PARAMS:
            return storeConnectionSecurityParameters(
                state,
                action.device,
                action.ownParams,
                null
            );
        default:
            return state;
    }
}
