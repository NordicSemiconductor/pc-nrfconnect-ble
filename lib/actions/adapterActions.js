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

import _ from 'lodash';
import { logger } from 'nrfconnect/core';
import { AdapterFactory, FirmwareRegistry } from 'pc-ble-driver-js';

import { discoverServices } from './deviceDetailsActions';
import { BLEEventState } from './common';
import { showErrorDialog } from './errorDialogActions';
import { hexStringToArray, toHexString } from '../utils/stringUtil';
import { getJlinkDeviceInfo } from '../api/nrfjprog';

export const ADAPTER_OPEN = 'ADAPTER_OPEN';
export const ADAPTER_OPENED = 'ADAPTER_OPENED';
export const ADAPTER_CLOSED = 'ADAPTER_CLOSED';
export const ADAPTER_ADDED = 'ADAPTER_ADDED';
export const ADAPTER_REMOVED = 'ADAPTER_REMOVED';
export const ADAPTER_ERROR = 'ADAPTER_ERROR';
export const ADAPTER_STATE_CHANGED = 'ADAPTER_STATE_CHANGED';
export const ADAPTER_RESET_PERFORMED = 'ADAPTER_RESET_PERFORMED';
export const ADAPTER_SCAN_TIMEOUT = 'ADAPTER_SCAN_TIMEOUT';
export const ADAPTER_ADVERTISEMENT_TIMEOUT = 'ADAPTER_ADVERTISEMENT_TIMEOUT';

export const DEVICE_DISCOVERED = 'DEVICE_DISCOVERED';
export const DEVICE_CONNECT = 'DEVICE_CONNECT';
export const DEVICE_CONNECTED = 'DEVICE_CONNECTED';
export const DEVICE_CONNECT_TIMEOUT = 'DEVICE_CONNECT_TIMEOUT';
export const DEVICE_DISCONNECT = 'DEVICE_DISCONNECT';
export const DEVICE_DISCONNECTED = 'DEVICE_DISCONNECTED';
export const DEVICE_CANCEL_CONNECT = 'DEVICE_CANCEL_CONNECT';
export const DEVICE_CONNECT_CANCELED = 'DEVICE_CONNECT_CANCELED';
export const DEVICE_INITIATE_PAIRING = 'DEVICE_INITIATE_PAIRING';
export const DEVICE_SECURITY_CHANGED = 'DEVICE_SECURITY_CHANGED';
export const DEVICE_ADD_BOND_INFO = 'DEVICE_ADD_BOND_INFO';
export const DEVICE_AUTH_ERROR_OCCURED = 'DEVICE_AUTH_ERROR_OCCURED';
export const DEVICE_AUTH_SUCCESS_OCCURED = 'DEVICE_AUTH_SUCCESS_OCCURED';
export const DEVICE_SECURITY_REQUEST_TIMEOUT = 'DEVICE_SECURITY_REQUEST_TIMEOUT';

export const DEVICE_CONNECTION_PARAM_UPDATE_REQUEST = 'DEVICE_CONNECTION_PARAM_UPDATE_REQUEST';
export const DEVICE_CONNECTION_PARAM_UPDATE_STATUS = 'DEVICE_CONNECTION_PARAM_UPDATE_STATUS';
export const DEVICE_CONNECTION_PARAMS_UPDATED = 'DEVICE_CONNECTION_PARAMS_UPDATED';
export const DEVICE_TOGGLE_AUTO_CONN_UPDATE = 'DEVICE_TOGGLE_AUTO_CONN_UPDATE';

export const DEVICE_PAIRING_STATUS = 'DEVICE_PAIRING_STATUS';
export const DEVICE_SECURITY_REQUEST = 'DEVICE_SECURITY_REQUEST';
export const DEVICE_PASSKEY_DISPLAY = 'DEVICE_PASSKEY_DISPLAY';
export const DEVICE_AUTHKEY_REQUEST = 'DEVICE_AUTHKEY_REQUEST';
export const DEVICE_LESC_OOB_REQUEST = 'DEVICE_LESC_OOB_REQUEST';
export const DEVICE_AUTHKEY_STATUS = 'DEVICE_AUTHKEY_STATUS';
export const DEVICE_PASSKEY_KEYPRESS_RECEIVED = 'DEVICE_PASSKEY_KEYPRESS_RECEIVED';
export const DEVICE_PASSKEY_KEYPRESS_SENT = 'DEVICE_PASSKEY_KEYPRESS_SENT';

export const DEVICE_SECURITY_STORE_PEER_PARAMS = 'DEVICE_SECURITY_STORE_PEER_PARAMS';
export const DEVICE_SECURITY_STORE_OWN_PARAMS = 'DEVICE_SECURITY_STORE_OWN_PARAMS';

export const DEVICE_DISABLE_EVENTS = 'DEVICE_DISABLE_EVENTS';
export const DEVICE_ENABLE_EVENTS = 'DEVICE_ENABLE_EVENTS';

export const ERROR_OCCURED = 'ERROR_OCCURED';

export const ATTRIBUTE_VALUE_CHANGED = 'ADAPTER_ATTRIBUTE_VALUE_CHANGED';

export const TRACE = 0;
export const DEBUG = 1;
export const INFO = 2;
export const WARNING = 3;
export const ERROR = 4;
export const FATAL = 5;

const adapterFactory = AdapterFactory.getInstance(null, {
    enablePolling: false,
});

// TODO: move to security reducer?
const secKeyset = {
    keys_own: {
        enc_key: null,
        id_key: null,
        sign_key: null,
        pk: null,
    },
    keys_peer: {
        enc_key: null,
        id_key: null,
        sign_key: null,
        pk: null,
    },
};

let throttledValueChangedDispatch;

function adapterOpenedAction(adapter) {
    return {
        type: ADAPTER_OPENED,
        adapter,
    };
}

function adapterOpenAction(adapter) {
    return {
        type: ADAPTER_OPEN,
        adapter,
    };
}

function adapterClosedAction(adapter) {
    return {
        type: ADAPTER_CLOSED,
        adapter,
    };
}

function adapterStateChangedAction(adapter, state) {
    return {
        type: ADAPTER_STATE_CHANGED,
        adapter,
        state,
    };
}

function connectionParamsUpdatedAction(device) {
    return {
        type: DEVICE_CONNECTION_PARAMS_UPDATED,
        device,
    };
}

function connectionParamUpdateStatusAction(id, device, status) {
    return {
        type: DEVICE_CONNECTION_PARAM_UPDATE_STATUS,
        id,
        device,
        status,
    };
}

function pairingStatusAction(id, device, status, ownSecurityParams, peerSecurityParams) {
    return {
        type: DEVICE_PAIRING_STATUS,
        id,
        device,
        status,
        ownSecurityParams,
        peerSecurityParams,
    };
}

function authKeyStatusAction(id, device, status) {
    return {
        type: DEVICE_AUTHKEY_STATUS,
        id,
        device,
        status,
    };
}

function deviceDiscoveredAction(device) {
    return {
        type: DEVICE_DISCOVERED,
        device,
    };
}

function deviceConnectAction(device) {
    return {
        type: DEVICE_CONNECT,
        device,
    };
}

function deviceConnectedAction(device) {
    return {
        type: DEVICE_CONNECTED,
        device,
    };
}

function deviceConnectTimeoutAction(deviceAddress) {
    return {
        type: DEVICE_CONNECT_TIMEOUT,
        deviceAddress,
    };
}

function scanTimeoutAction(adapter) {
    return {
        type: ADAPTER_SCAN_TIMEOUT,
        adapter,
    };
}

function advertiseTimeoutAction(adapter) {
    return {
        type: ADAPTER_ADVERTISEMENT_TIMEOUT,
        adapter,
    };
}

function deviceAuthErrorOccuredAction(device) {
    return {
        type: DEVICE_AUTH_ERROR_OCCURED,
        device,
    };
}

function deviceAuthSuccessOccuredAction(device) {
    return {
        type: DEVICE_AUTH_SUCCESS_OCCURED,
        device,
    };
}

function deviceSecurityRequestTimedOutAction(device) {
    return {
        type: DEVICE_SECURITY_REQUEST_TIMEOUT,
        device,
    };
}

function deviceDisconnectedAction(device, reason) {
    return {
        type: DEVICE_DISCONNECTED,
        device,
        reason,
    };
}

function deviceConnectCanceledAction() {
    return {
        type: DEVICE_CONNECT_CANCELED,
    };
}

function deviceCancelConnectAction() {
    return {
        type: DEVICE_CANCEL_CONNECT,
    };
}

function deviceConnParamUpdateRequestAction(device, requestedConnectionParams) {
    return {
        type: DEVICE_CONNECTION_PARAM_UPDATE_REQUEST,
        device,
        requestedConnectionParams,
    };
}

function passkeyDisplayAction(device, matchRequest, passkey, receiveKeypress) {
    return {
        type: DEVICE_PASSKEY_DISPLAY,
        device,
        matchRequest,
        passkey,
        receiveKeypress,
    };
}

function authKeyRequestAction(device, keyType, sendKeyPress) {
    return {
        type: DEVICE_AUTHKEY_REQUEST,
        device,
        keyType,
        sendKeypress: sendKeyPress,
    };
}

function lescOobRequestAction(device, ownOobData) {
    return {
        type: DEVICE_LESC_OOB_REQUEST,
        device,
        ownOobData,
    };
}

function securityRequestAction(device, params) {
    return {
        type: DEVICE_SECURITY_REQUEST,
        device,
        params,
    };
}

function addBondInfo(device, params) {
    return {
        type: DEVICE_ADD_BOND_INFO,
        device,
        params,
    };
}

function securityChangedAction(device, parameters) {
    return {
        type: DEVICE_SECURITY_CHANGED,
        device,
        parameters,
    };
}

function attributeValueChangedAction(attribute, value) {
    return {
        type: ATTRIBUTE_VALUE_CHANGED,
        attribute,
        value,
    };
}

function toggleAutoConnUpdateAction() {
    return {
        type: DEVICE_TOGGLE_AUTO_CONN_UPDATE,
    };
}

function adapterResetPerformedAction(adapter) {
    return {
        type: ADAPTER_RESET_PERFORMED,
        adapter,
    };
}

function keypressSentAction(eventId, device, keypressType) {
    return {
        type: DEVICE_PASSKEY_KEYPRESS_SENT,
        eventId,
        device,
        keypressType,
    };
}

function keypressReceivedAction(device, keypressType) {
    return {
        type: DEVICE_PASSKEY_KEYPRESS_RECEIVED,
        device,
        keypressType,
    };
}

function storeSecurityPeerParamsAction(device, peerParams) {
    return {
        type: DEVICE_SECURITY_STORE_PEER_PARAMS,
        device,
        peerParams,
    };
}

function storeSecurityOwnParamsAction(device, ownParams) {
    return {
        type: DEVICE_SECURITY_STORE_OWN_PARAMS,
        device,
        ownParams,
    };
}

function disableDeviceEventsAction(deviceAddress) {
    return {
        type: DEVICE_DISABLE_EVENTS,
        deviceAddress,
    };
}

function enableDeviceEventsAction(deviceAddress) {
    return {
        type: DEVICE_ENABLE_EVENTS,
        deviceAddress,
    };
}

// Internal functions

function setupListeners(dispatch, getState, adapterToUse) {
    // Remove all old listeners before adding new ones
    adapterToUse.removeAllListeners();

    // Listen to errors from this adapter since we are opening it now
    adapterToUse.on('error', error => {
        // TODO: separate between what is an non recoverable adapter error
        // TODO: and a recoverable error.
        // TODO: adapterErrorAction should only be used if it is an unrecoverable errors.
        // TODO: errorOccuredAction should be used for recoverable errors.
        const message = (error.description && error.description.errcode) ?
            `${error.message} (${error.description.errcode})`
            : `${error.message}`;
        dispatch(showErrorDialog(new Error(message)));
    });

    adapterToUse.on('warning', warning => {
        if (warning.message.includes('not supported')) {
            logger.warn(warning.message);
        } else {
            logger.info(warning.message);
        }
    });

    adapterToUse.on('logMessage', onLogMessage);

    // Listen to adapter changes
    adapterToUse.on('stateChanged', state => {
        dispatch(adapterStateChangedAction(adapterToUse, state));
    });

    adapterToUse.on('deviceDiscovered', device => {
        handleDeviceEvent(device, getState, () => {
            dispatch(deviceDiscoveredAction(device));
        });
    });

    adapterToUse.on('deviceConnected', device => {
        handleDeviceEvent(device, getState, () => {
            onDeviceConnected(dispatch, getState, device);
        });
    });

    adapterToUse.on('deviceDisconnected', (device, reason) => {
        handleDeviceEvent(device, getState, () => {
            dispatch(deviceDisconnectedAction(device, reason));
        });
    });

    adapterToUse.on('connectTimedOut', deviceAddress => {
        dispatch(deviceConnectTimeoutAction(deviceAddress));
    });

    adapterToUse.on('scanTimedOut', () => {
        dispatch(scanTimeoutAction(adapterToUse));
    });

    adapterToUse.on('advertiseTimedOut', () => {
        dispatch(advertiseTimeoutAction(adapterToUse));
    });

    adapterToUse.on('securityRequestTimedOut', device => {
        handleDeviceEvent(device, getState, () => {
            dispatch(deviceSecurityRequestTimedOutAction(device));
        });
    });

    adapterToUse.on('connParamUpdateRequest', (device, requestedConnectionParams) => {
        handleDeviceEvent(device, getState, () => {
            onConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams);
        });
    });

    adapterToUse.on('connParamUpdate', (device, connectionParams) => {
        handleDeviceEvent(device, getState, () => {
            onConnParamUpdate(dispatch, getState, device, connectionParams);
        });
    });

    adapterToUse.on('attMtuChanged', (device, mtu) => {
        handleDeviceEvent(device, getState, () => {
            onAttMtuChanged(dispatch, getState, device, mtu);
        });
    });

    adapterToUse.on('characteristicValueChanged', characteristic => {
        onAttributeValueChanged(dispatch, getState, characteristic, characteristic.valueHandle);
    });

    adapterToUse.on('descriptorValueChanged', descriptor => {
        onAttributeValueChanged(dispatch, getState, descriptor, descriptor.handle);
    });

    adapterToUse.on('securityChanged', (device, connectionSecurity) => {
        handleDeviceEvent(device, getState, () => {
            dispatch(securityChangedAction(device, connectionSecurity));
        });
    });

    adapterToUse.on('securityRequest', (device, params) => {
        handleDeviceEvent(device, getState, () => {
            onSecurityRequest(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('secParamsRequest', (device, peerParams) => {
        handleDeviceEvent(device, getState, () => {
            onSecParamsRequest(dispatch, getState, device, peerParams);
        });
    });

    adapterToUse.on('secInfoRequest', (device, params) => {
        handleDeviceEvent(device, getState, () => {
            onSecInfoRequest(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('authKeyRequest', (device, keyType) => {
        handleDeviceEvent(device, getState, () => {
            onAuthKeyRequest(dispatch, getState, device, keyType);
        });
    });

    adapterToUse.on('passkeyDisplay', (device, matchRequest, passkey) => {
        handleDeviceEvent(device, getState, () => {
            onPasskeyDisplay(dispatch, getState, device, matchRequest, passkey);
        });
    });

    adapterToUse.on('lescDhkeyRequest', (device, peerPublicKey, oobDataRequired) => {
        handleDeviceEvent(device, getState, () => {
            onLescDhkeyRequest(dispatch, getState, device, peerPublicKey, oobDataRequired);
        });
    });

    adapterToUse.on('keyPressed', (device, keypressType) => {
        handleDeviceEvent(device, getState, () => {
            dispatch(keypressReceivedAction(device, keypressType));
        });
    });

    adapterToUse.on('authStatus', (device, params) => {
        handleDeviceEvent(device, getState, () => {
            onAuthStatus(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('status', status => {
        onStatus(dispatch, getState, status, adapterToUse);
    });
}

function handleDeviceEvent(device, getState, handleFn) {
    if (!getState().app.adapter.ignoredDeviceAddresses.has(device.address)) {
        handleFn();
    }
}

function onDeviceConnected(dispatch, getState, device) {
    const adapterToUse = getState().app.adapter.bleDriver.adapter;

    if (!adapterToUse) {
        logger.warn('No adapter');
        return;
    }

    const bondInfo = getState().app.adapter.getIn(['selectedAdapter', 'security', 'bondStore', device.address]);

    if (device.role === 'peripheral' && bondInfo) {
        const isLesc = bondInfo.getIn(['keys_own', 'enc_key', 'enc_info', 'lesc']);

        let encInfo;
        let masterId;

        if (isLesc) {
            encInfo = bondInfo.getIn(['keys_own', 'enc_key', 'enc_info']).toJS();
            masterId = bondInfo.getIn(['keys_own', 'enc_key', 'master_id']).toJS();
        } else {
            encInfo = bondInfo.getIn(['keys_peer', 'enc_key', 'enc_info']).toJS();
            masterId = bondInfo.getIn(['keys_peer', 'enc_key', 'master_id']).toJS();
        }

        adapterToUse.encrypt(device.instanceId, masterId, encInfo, error => {
            if (error) {
                logger.warn(`Encrypt procedure failed: ${error}`);
            }

            logger.debug(`Encrypt, masterId: ${JSON.stringify(masterId)}, encInfo: ${JSON.stringify(encInfo)}`);
        });
    }

    dispatch(deviceConnectedAction(device));
    dispatch(discoverServices(device));
}

function onAttributeValueChanged(dispatch, getState, attribute, handle) {
    let val;
    if (Array.isArray(attribute.value)) {
        val = attribute.value;
    } else if (attribute.value) {
        val = attribute.value[Object.keys(attribute.value)[0]];
    }

    logger.info(`Attribute value changed, handle: 0x${toHexString(handle)}, value (0x): ${toHexString(val)}`);

    if (!throttledValueChangedDispatch) {
        throttledValueChangedDispatch = _.throttle((attribute2, value) => {
            dispatch(attributeValueChangedAction(attribute2, value));
        }, 500);
    }

    throttledValueChangedDispatch(attribute, attribute.value);
}

function onConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams) {
    if (getState().app.adapter.autoConnUpdate === true) {
        const connParams = {
            ...requestedConnectionParams,
            maxConnectionInterval: requestedConnectionParams.minConnectionInterval,
        };
        updateConnectionParams(dispatch, getState, -1, device, connParams);
    } else {
        dispatch(deviceConnParamUpdateRequestAction(device, requestedConnectionParams));
    }
}

function onConnParamUpdate(dispatch, getState, device, connectionParams) {
    if (device.role === 'central' && !getState().app.adapter.autoConnUpdate) {
        dispatch(deviceConnParamUpdateRequestAction(device, connectionParams));
    }

    dispatch(connectionParamUpdateStatusAction(-1, device, -1));
    dispatch(connectionParamsUpdatedAction(device));
}

function onAttMtuChanged(dispatch, getState, device, mtu) {
    logger.info(`ATT MTU changed, new value is ${mtu}`);
}

function onSecurityRequest(dispatch, getState, device, params) {
    const state = getState();
    const selectedAdapter = state.app.adapter.selectedAdapter;
    const defaultSecParams = selectedAdapter.security.securityParams;

    if (!defaultSecParams) {
        logger.warn('Security request received but security state is undefined');
        return;
    }

    if (selectedAdapter.security.autoAcceptPairing) {
        dispatch(storeSecurityOwnParamsAction(device, defaultSecParams));
        authenticate(dispatch, getState, device, defaultSecParams);
    } else {
        dispatch(securityRequestAction(device, params));
    }
}

function onSecParamsRequest(dispatch, getState, device, peerParams) {
    const state = getState();
    const selectedAdapter = state.app.adapter.selectedAdapter;
    const defaultSecParams = selectedAdapter.security.securityParams;

    const adapterToUse = getState().app.adapter.bleDriver.adapter;

    dispatch(storeSecurityPeerParamsAction(device, peerParams));

    secKeyset.keys_own.pk = { pk: adapterToUse.computePublicKey() };

    if (device.role === 'central') {
        if (device.ownPeriphInitiatedPairingPending) {
            // If pairing initiated by own peripheral, proceed directly with replySecParams
            let periphInitSecParams = getState().app.adapter.getIn(['selectedAdapter',
                'security', 'connectionsSecParameters', device.address, 'ownParams',
            ]);

            if (!periphInitSecParams) {
                logger.info('Could not retrieve stored security params, using default params');
                periphInitSecParams = defaultSecParams;
            }

            adapterToUse.replySecParams(device.instanceId, 0, periphInitSecParams, secKeyset,
                error => {
                    if (error) {
                        logger.warn(`Error when calling replySecParams: ${error}`);
                        dispatch(deviceAuthErrorOccuredAction(device));
                    }

                    logger.debug(`ReplySecParams, secParams: ${periphInitSecParams}`);
                    dispatch(storeSecurityOwnParamsAction(device, periphInitSecParams));
                },
            );
        } else if (selectedAdapter.security.autoAcceptPairing) {
            dispatch(acceptPairing(-1, device, defaultSecParams));
        } else {
            const secParams = {
                bond: peerParams.bond,
                mitm: peerParams.mitm,
                lesc: peerParams.lesc,
                keypress: peerParams.keypress,
            };
            dispatch(securityRequestAction(device, secParams));
        }
    } else if (device.role === 'peripheral') {
        adapterToUse.replySecParams(device.instanceId, 0, null, secKeyset, error => {
            if (error) {
                logger.warn(`Error when calling replySecParams: ${error}`);
                dispatch(deviceAuthErrorOccuredAction(device));
            }

            logger.debug('ReplySecParams, secParams: null');
        });
    }
}

function onSecInfoRequest(dispatch, getState, device) {
    const adapterToUse = getState().app.adapter.bleDriver.adapter;

    const bondInfo = getState().app.adapter.getIn(['selectedAdapter', 'security', 'bondStore', device.address]);

    let encInfo;
    let idInfo;

    if (bondInfo) {
        encInfo = bondInfo.getIn(['keys_own', 'enc_key', 'enc_info']).toJS();
        idInfo = bondInfo.getIn(['keys_own', 'id_key', 'id_info']).toJS();
    } else {
        logger.info(`Peer requested encryption, but no keys are found for address ${device.address}`);
        encInfo = null;
        idInfo = null;
    }

    adapterToUse.secInfoReply(device.instanceId, encInfo, idInfo, null, error => {
        if (error) {
            logger.warn(`Error when calling secInfoReply: ${error}`);
            dispatch(deviceAuthErrorOccuredAction(device));
        }

        logger.debug(`SecInfoReply, ${JSON.stringify(encInfo)}, ${JSON.stringify(idInfo)}`);
    });
}

function onAuthKeyRequest(dispatch, getState, device, keyType) {
    // TODO: add if enableKeypress shall be sent
    // Find sec params info regarding if keypress notification shall be sent
    const secParameters = getState().app.adapter.getIn(['selectedAdapter', 'security', 'connectionsSecParameters', device.address]);
    const sendKeyPress = secParameters.peerParams.keypress === true
        && secParameters.ownParams.keypress === true;

    dispatch(authKeyRequestAction(device, keyType, sendKeyPress));
}

function onPasskeyDisplay(dispatch, getState, device, matchRequest, passkey) {
    const secParameters = getState().app.adapter.getIn(['selectedAdapter', 'security', 'connectionsSecParameters', device.address]);
    const receiveKeypress = secParameters.peerParams.keypress === true
        && secParameters.ownParams.keypress === true;
    dispatch(passkeyDisplayAction(device, matchRequest, passkey, receiveKeypress));
}

function onLescDhkeyRequest(dispatch, getState, device, peerPublicKey, oobdRequired) {
    const adapterToUse = getState().app.adapter.bleDriver.adapter;

    const dhKey = adapterToUse.computeSharedSecret(peerPublicKey);

    adapterToUse.replyLescDhkey(device.instanceId, dhKey, error => {
        if (error) {
            logger.warn('Error when sending LESC DH key');
            dispatch(deviceAuthErrorOccuredAction(device));
        }
    });

    const publicKey = adapterToUse.computePublicKey();
    adapterToUse.getLescOobData(device.instanceId, publicKey, (error, ownOobData) => {
        if (error) {
            logger.warn(`Error in getLescOobData: ${error.message}`);
            dispatch(deviceAuthErrorOccuredAction(device));
            return;
        }

        logger.debug(`Own OOB data: ${JSON.stringify(ownOobData)}`);

        if (oobdRequired) {
            dispatch(lescOobRequestAction(device, ownOobData));
        }
    });
}

function onAuthStatus(dispatch, getState, device, params) {
    if (params.auth_status !== 0) {
        logger.warn(`Authentication failed with status ${params.auth_status_name}`);
        dispatch(deviceAuthErrorOccuredAction(device));
        return;
    }

    dispatch(deviceAuthSuccessOccuredAction(device));

    if (!(params.keyset && params.keyset.keys_own && params.keyset.keys_own.pk &&
          params.keyset.keys_own.enc_key && params.keyset.keys_own.id_key)) {
        return;
    }

    if (!params.bonded) {
        logger.debug('No bonding performed, do not store keys');
        return;
    }

    dispatch(addBondInfo(device, params));
}

function authenticate(dispatch, getState, device, securityParams) {
    const adapterToUse = getState().app.adapter.bleDriver.adapter;

    return new Promise((resolve, reject) => {
        adapterToUse.authenticate(device.instanceId, securityParams, error => {
            if (error) {
                reject(new Error(error.message));
                dispatch(deviceAuthErrorOccuredAction(device));
            }

            resolve(adapterToUse);
        });
    });
}

function onLogMessage(severity, message) {
    switch (severity) {
        case TRACE:
        case DEBUG:
            logger.debug(message);
            break;
        case INFO:
            logger.info(message);
            break;
        case WARNING:
            logger.warn(message);
            break;
        case ERROR:
        case FATAL:
            logger.error(message);
            break;
        default:
            logger.warn(`Log message of unknown severity ${severity} received: ${message}`);
    }
}

function onStatus(dispatch, getState, status, adapterToUse) {
    if (adapterToUse === undefined || adapterToUse === null) {
        logger.error('Received status callback, but adapter is not selected yet.');
        return;
    }

    // Check if it is a reset performed status and if selectedAdapter is set.
    // selectedAdapter is set in the immutable state of the application after
    // the adapter has been successfully opened.
    if (status.name === 'RESET_PERFORMED') {
        if (adapterToUse) {
            dispatch(adapterResetPerformedAction(adapterToUse));
        }
    } else if (status.name === 'CONNECTION_ACTIVE') {
        enableBLE(dispatch, adapterToUse);
    } else {
        logger.error(`Received status with code ${status.id} ${status.name}, message: '${status.message}'`);
    }
}

function enableBLE(dispatch, adapter) {
    // Adapter has been through state RESET and has now transitioned to
    // CONNECTION_ACTIVE, we now need to enable the BLE stack
    if (!adapter) {
        logger.error('Trying to enable BLE, but adapter not provided.');
        return;
    }

    new Promise((resolve, reject) => {
        adapter.enableBLE(null, error => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve();
            }
        });
    }).then(() => (
        // Initiate fetching of adapter state, let API emit state changes
        new Promise((resolve, reject) => {
            adapter.getState(error => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve();
                }
            });
        })
    )).then(() => {
        logger.debug('SoftDevice BLE stack enabled.');
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function updateConnectionParams(dispatch, getState, id, device, connectionParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.bleDriver.adapter;

        adapterToUse.updateConnectionParameters(
            device.instanceId,
            connectionParams,
            (error, updatedDevice) => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve(updatedDevice);
                }
            },
        );
    }).then(updatedDevice => {
        dispatch(connectionParamUpdateStatusAction(id, updatedDevice, BLEEventState.SUCCESS));
    }).catch(error => {
        dispatch(connectionParamUpdateStatusAction(id, device, BLEEventState.ERROR));
        dispatch(showErrorDialog(error));
    });
}

function replyAuthenticationKey(dispatch, getState, id, device, keyType, key) {
    const adapterToUse = getState().app.adapter.bleDriver.adapter;
    const driver = adapterToUse.driver;

    if (adapterToUse === null) {
        dispatch(showErrorDialog(new Error('No adapter selected!')));
    }

    // Check if we shall send keypressEnd based
    // on keypressStart has been sent previously
    const shoulSendKeypress = getState().app.bleEvent.getIn(
        [
            'events',
            id,
            'keypressStartSent',
        ],
    );

    return new Promise((resolve, reject) => {
        if (shoulSendKeypress === true) {
            adapterToUse.notifyKeypress(
                device.instanceId,
                driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_END,
                error => {
                    if (error) {
                        reject(new Error(error.message));
                    } else {
                        resolve();
                    }
                },
            );
        } else {
            resolve();
        }
    }).then(() => {
        if (shoulSendKeypress === true) {
            dispatch(keypressSentAction(id, device, 'BLE_GAP_KP_NOT_TYPE_PASSKEY_END'));
        }

        return new Promise((resolve, reject) => {
            const keyTypeValues = {
                BLE_GAP_AUTH_KEY_TYPE_PASSKEY: 1,
                BLE_GAP_AUTH_KEY_TYPE_OOB: 2,
            };
            const keyTypeInt = keyTypeValues[keyType] || 0;

            adapterToUse.replyAuthKey(device.instanceId, keyTypeInt, key, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                resolve();
            });
        }).then(() => {
            dispatch(pairingStatusAction(id, device, BLEEventState.PENDING));
        }).catch(error => {
            dispatch(showErrorDialog(error));
            dispatch(authKeyStatusAction(id, device, BLEEventState.ERROR));
        });
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function closeSelectedAdapter(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const adapter = getState().app.adapter.bleDriver.adapter;
        if (adapter) {
            adapter.close(error => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    }).then(() => {
        const adapter = getState().app.adapter.selectedAdapter;
        if (adapter) {
            dispatch(adapterClosedAction(adapter));
        }
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

/**
 * Creates and opens a pc-ble-driver-js adapter with the given serial
 * port COM name and device family.
 *
 * @param {String} comName Serial port COM name, e.g. COM1, /dev/ttyACM0
 * @param {Number} baudRate The baud rate to use when opening the serial port.
 * @param {Number} sdBleApiVersion SoftDevice version number.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function openAdapter(comName, baudRate, sdBleApiVersion) {
    return (dispatch, getState) => (
        Promise.resolve()
            .then(() => {
                // Check if we already have an adapter open, if so, close it
                if (getState().app.adapter.bleDriver.adapter !== null) {
                    return closeSelectedAdapter(dispatch, getState);
                }
                return Promise.resolve();
            })
            .then(() => {
                const adapter = adapterFactory.createAdapter(`v${sdBleApiVersion}`, comName, comName);
                dispatch(adapterOpenAction(adapter));
                setupListeners(dispatch, getState, adapter);

                const openOptions = {
                    baudRate,
                    parity: 'none',
                    flowControl: 'none',
                    eventInterval: 0,
                    logLevel: 'debug',
                    enableBLE: false,
                };

                // Opening adapter fails occasionally when trying to open right after the device
                // has been set up. Applying this setTimeout hack, so that the port/devkit has
                // some time to clean up before we open.
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        adapter.open(openOptions, error => {
                            if (error) {
                                reject(error);
                            } else {
                                dispatch(adapterOpenedAction(adapter));
                                resolve(adapter);
                            }
                        });
                    }, 500);
                });
            })
            .catch(error => logger.error(error.message))
    );
}

/**
 * Creates and opens a pc-ble-driver-js adapter for a J-Link device with the
 * given serial port COM name and J-Link serial number.
 *
 * @param {String} comName Serial port COM name, e.g. COM1, /dev/ttyACM0
 * @param {String|Number} serialNumber J-Link serial number.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function openJlinkAdapter(comName, serialNumber) {
    return dispatch => {
        logger.info('Getting information from J-Link debugger...');
        getJlinkDeviceInfo(serialNumber)
            .then(jlinkDeviceInfo => {
                logger.info(`Found device type: ${jlinkDeviceInfo.type}. ` +
                    `J-Link firmware: ${jlinkDeviceInfo.firmwareString}.`);
                try {
                    const { version, baudRate, sdBleApiVersion } =
                        FirmwareRegistry.getJlinkConnectivityFirmware(jlinkDeviceInfo.family);
                    logger.info(`Connectivity firmware version: ${version}. ` +
                        `SoftDevice API version: ${sdBleApiVersion}. Baud rate: ${baudRate}.`);
                    dispatch(openAdapter(comName, baudRate, sdBleApiVersion));
                } catch (error) {
                    logger.error(`Unable to open device: ${error.message}`);
                }
            });
    };
}

/**
 * Creates and opens a pc-ble-driver-js adapter for a Nordic USB device with
 * the given serial port COM name.
 *
 * @param {String} comName Serial port COM name, e.g. COM1, /dev/ttyACM0
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function openNordicUsbAdapter(comName) {
    return dispatch => {
        const { version, baudRate, sdBleApiVersion } =
            FirmwareRegistry.getNordicUsbConnectivityFirmware();
        logger.info(`Connectivity firmware version: ${version}. ` +
            `SoftDevice API version: ${sdBleApiVersion}. Baud rate: ${baudRate}.`);
        dispatch(openAdapter(comName, baudRate, sdBleApiVersion));
    };
}

/**
 * Closes the currently selected pc-ble-driver-js adapter. Returns a promise
 * that resolves when the adapter has been closed.
 *
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function closeAdapter() {
    return (dispatch, getState) => (
        closeSelectedAdapter(dispatch, getState)
    );
}

export function connectToDevice(device) {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
            }

            const connectionParameters = {
                min_conn_interval: 7.5,
                max_conn_interval: 7.5,
                slave_latency: 0,
                conn_sup_timeout: 4000,
            };

            const scanParameters = {
                active: true,
                interval: 100,
                window: 50,
                timeout: 20,
            };

            const options = {
                scanParams: scanParameters,
                connParams: connectionParameters,
            };

            dispatch(deviceConnectAction(device));

            adapterToUse.connect(
                { address: device.address, type: device.addressType },
                options,
                error => {
                    if (error) {
                        reject(new Error(error.message));
                    } else {
                        resolve();
                    }
                },
            );
        }).catch(error => {
            dispatch(showErrorDialog(error));
        })
    );
}

export function disconnectFromDevice(device) {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
            }

            adapterToUse.disconnect(device.instanceId, (error, disconnectedDevice) => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve(disconnectedDevice);
                }
            });
        }).catch(error => {
            dispatch(showErrorDialog(error));
        })
    );
}

/**
 * Treat the device as disconnected in the UI, but keep the connection inside the
 * pc-ble-driver-js adapter.
 *
 * @param {Object} device The device to detach from.
 * @returns {Object} Action object to be passed to the redux dispatch function.
 */
export function detachFromDevice(device) {
    return deviceDisconnectedAction(device);
}

export function pairWithDevice(id, device, securityParams) {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (!adapterToUse) {
                reject(new Error('No adapter selected!'));
            }

            adapterToUse.authenticate(device.instanceId, securityParams, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                logger.debug(`Authenticate, secParams: ${securityParams}`);
                resolve();
            });
        }).then(() => {
            dispatch(storeSecurityOwnParamsAction(device, securityParams));
            dispatch(pairingStatusAction(id, device, BLEEventState.PENDING));
        }).catch(error => {
            dispatch(pairingStatusAction(id, device, BLEEventState.ERROR));
            dispatch(showErrorDialog(error));
        })
    );
}

export function acceptPairing(id, device, securityParams) {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected!'));
            }

            secKeyset.keys_own.pk = { pk: adapterToUse.computePublicKey() };

            if (device.role === 'peripheral') {
                adapterToUse.authenticate(device.instanceId, securityParams, error => {
                    if (error) {
                        reject(new Error(error.message));
                    }

                    logger.debug(`Authenticate, secParams: ${securityParams}`);
                    resolve();
                });
            } else if (device.role === 'central') {
                adapterToUse.replySecParams(device.instanceId, 0, securityParams, secKeyset,
                    error => {
                        if (error) {
                            reject(new Error(error.message));
                        }

                        logger.debug(`ReplySecParams, secParams: ${JSON.stringify(securityParams)}, secKeyset: ${JSON.stringify(secKeyset)}`);
                        resolve();
                    },
                );
            } else {
                reject(new Error('Unknown role'));
            }
        }).then(() => {
            dispatch(storeSecurityOwnParamsAction(device, securityParams));
            dispatch(pairingStatusAction(id, device, BLEEventState.PENDING));
        }).catch(() => {
            dispatch(pairingStatusAction(id, device, BLEEventState.ERROR));
        })
    );
}

export function rejectPairing(id, device) {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected!'));
            }

            if (device.role === 'peripheral') {
                adapterToUse.authenticate(device.instanceId, null, error => {
                    if (error) {
                        reject(new Error(error.message));
                    }

                    resolve();
                });
            } else if (device.role === 'central') {
                const PAIRING_NOT_SUPPORTED = 0x85;
                adapterToUse.replySecParams(
                    device.instanceId,
                    PAIRING_NOT_SUPPORTED,
                    null,
                    null,
                    error => {
                        if (error) {
                            reject(new Error(error.message));
                        }

                        resolve();
                    },
                );
            } else {
                reject(new Error('Invalid role'));
            }
        }).then(() => {
            dispatch(pairingStatusAction(id, device, BLEEventState.REJECTED));
        }).catch(() => {
            dispatch(pairingStatusAction(id, device, BLEEventState.ERROR));
        })
    );
}

export function replyNumericalComparisonMatch(id, device, match) {
    return (dispatch, getState) => {
        if (match) {
            return replyAuthenticationKey(dispatch, getState, id, device, 'BLE_GAP_AUTH_KEY_TYPE_PASSKEY', null);
        }
        return replyAuthenticationKey(dispatch, getState, id, device, 'BLE_GAP_AUTH_KEY_TYPE_NONE', null);
    };
}

export function replyAuthKey(id, device, keyType, key) {
    return (dispatch, getState) =>
        replyAuthenticationKey(dispatch, getState, id, device, keyType, key);
}

export function replyLescOob(id, device, peerOob, ownOobData) {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;
            let peerOobData;

            if (peerOob.confirm === '' || peerOob.random === '') {
                peerOobData = null;
            } else {
                peerOobData = {
                    addr: {
                        address: device.address,
                        type: device.addressType,
                    },
                    r: hexStringToArray(peerOob.random),
                    c: hexStringToArray(peerOob.confirm),
                };
            }

            logger.debug(`setLescOobData, ownOobData: ${JSON.stringify(ownOobData)}, peerOobData: ${JSON.stringify(peerOobData)}`);

            adapterToUse.setLescOobData(device.instanceId, ownOobData, peerOobData, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                resolve();
            });
        }).then(() => {
            dispatch(pairingStatusAction(id, device, BLEEventState.PENDING));
        }).catch(error => {
            dispatch(showErrorDialog(error));
            dispatch(authKeyStatusAction(id, device, BLEEventState.ERROR));
        })
    );
}

export function sendKeypress(id, device, keypressType) {
    return (dispatch, getState) => {
        const eventId = id;
        const adapterToUse = getState().app.adapter.bleDriver.adapter;
        const driver = adapterToUse.driver;

        const keypressStartSent = getState().app.bleEvent.getIn(
            [
                'events',
                eventId,
                'keypressStartSent',
            ]);

        if (adapterToUse === null) {
            dispatch(showErrorDialog('No adapter selected!'));
            return;
        }

        new Promise((resolve, reject) => {
            if (keypressStartSent !== true) {
                adapterToUse.notifyKeypress(
                    device.instanceId,
                    driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_START,
                    error => {
                        if (error) {
                            reject(new Error(error.message));
                        } else {
                            resolve();
                        }
                    },
                );
            } else {
                resolve();
            }
        }).then(() => {
            dispatch(keypressSentAction(eventId, device, 'BLE_GAP_KP_NOT_TYPE_PASSKEY_START'));

            return new Promise((resolve, reject) => {
                let keypressTypeValue;

                if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_START') {
                    keypressTypeValue = driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_START;
                } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_END') {
                    keypressTypeValue = driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_END;
                } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_IN') {
                    keypressTypeValue = driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_IN;
                } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_OUT') {
                    keypressTypeValue = driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_OUT;
                } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_CLEAR') {
                    keypressTypeValue = driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_CLEAR;
                } else {
                    reject(new Error('Unknown keypress received.'));
                    return;
                }

                adapterToUse.notifyKeypress(device.instanceId, keypressTypeValue, error => {
                    if (error) {
                        reject(new Error(error.message));
                    } else {
                        resolve();
                    }
                });
            }).then(() => {
                dispatch(keypressSentAction(eventId, device, keypressType));
            }).catch(error => {
                dispatch(showErrorDialog(error));
            });
        }).catch(error => {
            dispatch(showErrorDialog(error));
        });
    };
}

export function cancelConnect() {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            dispatch(deviceCancelConnectAction());

            adapterToUse.cancelConnect(error => {
                if (error) {
                    reject(new Error(error.message));
                }

                resolve();
            });
        }).then(() => {
            dispatch(deviceConnectCanceledAction());
        }).catch(error => {
            dispatch(showErrorDialog(error));
        })
    );
}

export function updateDeviceConnectionParams(id, device, connectionParams) {
    return (dispatch, getState) => updateConnectionParams(
        dispatch, getState, id, device, connectionParams,
    );
}

export function rejectDeviceConnectionParams(id, device) {
    return (dispatch, getState) => (
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected!'));
            }

            adapterToUse.rejectConnParams(device.instanceId, error => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve();
                }
            });
        }).then(() => {
            dispatch(connectionParamUpdateStatusAction(id, device, BLEEventState.REJECTED));
        }).catch(error => {
            dispatch(connectionParamUpdateStatusAction(id, device, BLEEventState.ERROR));
            dispatch(showErrorDialog(error));
        })
    );
}

export function toggleAutoConnUpdate() {
    return toggleAutoConnUpdateAction();
}

export function disableDeviceEvents(deviceAddress) {
    return disableDeviceEventsAction(deviceAddress);
}

export function enableDeviceEvents(deviceAddress) {
    return enableDeviceEventsAction(deviceAddress);
}
