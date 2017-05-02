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

import { discoverServices } from './deviceDetailsActions';
import { BLEEventState } from './common';
import { showErrorDialog } from './errorDialogActions';
import { hexStringToArray, toHexString } from '../utils/stringUtil';

import { coreApi } from './coreActionsHack';

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

function adapterRemovedAction(adapter) {
    return {
        type: ADAPTER_REMOVED,
        adapter,
    };
}

function adapterAddedAction(adapter) {
    return {
        type: ADAPTER_ADDED,
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

function LgetAdapters(dispatch, getState, bleDriver) {
    return new Promise((resolve, reject) => {
        // Register listeners for adapters added/removed
        const LadapterFactory = bleDriver.AdapterFactory.getInstance();
        LadapterFactory.removeAllListeners();
        LadapterFactory.on('added', adapter => {
            dispatch(adapterAddedAction(adapter));
        });
        LadapterFactory.on('removed', adapter => {
            const { app } = getState();
            const adapterIndex = app.adapter.adapters.findIndex(
                a => (a.state.instanceId === adapter.state.instanceId),
            );
            if (adapterIndex === app.adapter.selectedAdapterIndex) {
                dispatch({ type: 'SERIAL_PORT_DESELECTED' });
            }
            dispatch(adapterRemovedAction(adapter));
        });
        LadapterFactory.on('error', error => {
            dispatch(showErrorDialog(new Error(error.message)));
        });

        LadapterFactory.getAdapters(error => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve();
            }
        });
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LsetupListeners(dispatch, getState, adapterToUse) {
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
            coreApi.logger.warn(warning.message);
        } else {
            coreApi.logger.info(warning.message);
        }
    });

    adapterToUse.on('logMessage', LonLogMessage);

    // Listen to adapter changes
    adapterToUse.on('stateChanged', state => {
        dispatch(adapterStateChangedAction(adapterToUse, state));
    });

    adapterToUse.on('deviceDiscovered', device => {
        LhandleDeviceEvent(device, getState, () => {
            dispatch(deviceDiscoveredAction(device));
        });
    });

    adapterToUse.on('deviceConnected', device => {
        LhandleDeviceEvent(device, getState, () => {
            LonDeviceConnected(dispatch, getState, device);
        });
    });

    adapterToUse.on('deviceDisconnected', (device, reason) => {
        LhandleDeviceEvent(device, getState, () => {
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
        LhandleDeviceEvent(device, getState, () => {
            dispatch(deviceSecurityRequestTimedOutAction(device));
        });
    });

    adapterToUse.on('connParamUpdateRequest', (device, requestedConnectionParams) => {
        LhandleDeviceEvent(device, getState, () => {
            LonConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams);
        });
    });

    adapterToUse.on('connParamUpdate', (device, connectionParams) => {
        LhandleDeviceEvent(device, getState, () => {
            LonConnParamUpdate(dispatch, getState, device, connectionParams);
        });
    });

    adapterToUse.on('attMtuChanged', (device, mtu) => {
        LhandleDeviceEvent(device, getState, () => {
            LonAttMtuChanged(dispatch, getState, device, mtu);
        });
    });

    adapterToUse.on('characteristicValueChanged', characteristic => {
        LonAttributeValueChanged(dispatch, getState, characteristic, characteristic.valueHandle);
    });

    adapterToUse.on('descriptorValueChanged', descriptor => {
        LonAttributeValueChanged(dispatch, getState, descriptor, descriptor.handle);
    });

    adapterToUse.on('securityChanged', (device, connectionSecurity) => {
        LhandleDeviceEvent(device, getState, () => {
            dispatch(securityChangedAction(device, connectionSecurity));
        });
    });

    adapterToUse.on('securityRequest', (device, params) => {
        LhandleDeviceEvent(device, getState, () => {
            LonSecurityRequest(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('secParamsRequest', (device, peerParams) => {
        LhandleDeviceEvent(device, getState, () => {
            LonSecParamsRequest(dispatch, getState, device, peerParams);
        });
    });

    adapterToUse.on('secInfoRequest', (device, params) => {
        LhandleDeviceEvent(device, getState, () => {
            LonSecInfoRequest(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('authKeyRequest', (device, keyType) => {
        LhandleDeviceEvent(device, getState, () => {
            LonAuthKeyRequest(dispatch, getState, device, keyType);
        });
    });

    adapterToUse.on('passkeyDisplay', (device, matchRequest, passkey) => {
        LhandleDeviceEvent(device, getState, () => {
            LonPasskeyDisplay(dispatch, getState, device, matchRequest, passkey);
        });
    });

    adapterToUse.on('lescDhkeyRequest', (device, peerPublicKey, oobDataRequired) => {
        LhandleDeviceEvent(device, getState, () => {
            LonLescDhkeyRequest(dispatch, getState, device, peerPublicKey, oobDataRequired);
        });
    });

    adapterToUse.on('keyPressed', (device, keypressType) => {
        LhandleDeviceEvent(device, getState, () => {
            LonKeyPressed(dispatch, getState, device, keypressType);
        });
    });

    adapterToUse.on('authStatus', (device, params) => {
        LhandleDeviceEvent(device, getState, () => {
            LonAuthStatus(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('status', status => {
        LonStatus(dispatch, getState, status, adapterToUse);
    });
}

function LhandleDeviceEvent(device, getState, handleFn) {
    if (!getState().app.adapter.ignoredDeviceAddresses.has(device.address)) {
        handleFn();
    }
}

function LvalidatePort(dispatch, getState, port, SerialPort) {
    const adapterToUse = getState().app.adapter.api.adapters.find(
        x => (x.state.port === port.comName),
    );
    return new Promise((resolve, reject) => {
        if (adapterToUse === null) {
            reject(new Error(`Not able to find ${port.comName}.`));
        }

        const serialPort = new SerialPort(port.comName, { autoOpen: false });

        serialPort.open(err => {
            if (err) {
                reject(new Error('Could not open the port. Please power cycle the device and try again.'));
                coreApi.logger.debug(`Serial port error: ${err}`);
                return;
            }

            resolve(serialPort);
        });
    })
    .then(serialPort => (
        new Promise((resolve, reject) => {
            serialPort.close(err => {
                if (err) {
                    reject();
                    coreApi.logger.debug(`Serial port error: ${err}`);
                    return;
                }

                resolve();
            });
        })
    ))
    .then(() => adapterToUse);
}

function LopenAdapter(dispatch, getState, port, versionInfo, SerialPort) {
    return new Promise((resolve, reject) => {
        // Check if we already have an adapter open, if so, close it
        if (getState().app.adapter.api.selectedAdapter !== null) {
            LcloseAdapter(dispatch, getState).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        } else {
            resolve();
        }
    }).then(() => LvalidatePort(dispatch, getState, port, SerialPort))
    .then(adapterToUse => (
        new Promise((resolve, reject) => {
            if (!adapterToUse) {
                reject(new Error(`Not able to find ${port.comName}.`));
                return;
            }

            const { baudRate } = versionInfo;
            const options = {
                baudRate,
                parity: 'none',
                flowControl: 'none',
                eventInterval: 10,
                logLevel: 'debug',
                enableBLE: false,
            };

            dispatch(adapterOpenAction(adapterToUse));
            LsetupListeners(dispatch, getState, adapterToUse);

            adapterToUse.open(options, error => {
                if (error) {
                    reject(error); // Let the error event inform the user about the error.
                    return;
                }
                resolve(adapterToUse);
            });
        }).then(adapter => {
            dispatch(adapterOpenedAction(adapter));
        })
    ))
    .catch(error => {
        // Let the error event inform the user about the error.
        coreApi.logger.error(error.message);
        console.error(error);
    });
}

function LonDeviceConnected(dispatch, getState, device) {
    const adapterToUse = getState().app.adapter.api.selectedAdapter;

    if (!adapterToUse) {
        coreApi.logger.warn('No adapter');
        return;
    }

    const bondInfo = getState().app.adapter.getIn(['adapters', getState().app.adapter.selectedAdapterIndex, 'security', 'bondStore', device.address]);

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
                coreApi.logger.warn(`Encrypt procedure failed: ${error}`);
            }

            coreApi.logger.debug(`Encrypt, masterId: ${JSON.stringify(masterId)}, encInfo: ${JSON.stringify(encInfo)}`);
        });
    }

    dispatch(deviceConnectedAction(device));
    dispatch(discoverServices(device));
}

function LonAttributeValueChanged(dispatch, getState, attribute, handle) {
    let val;
    if (Array.isArray(attribute.value)) {
        val = attribute.value;
    } else if (attribute.value) {
        val = attribute.value[Object.keys(attribute.value)[0]];
    }

    coreApi.logger.info(`Attribute value changed, handle: 0x${toHexString(handle)}, value (0x): ${toHexString(val)}`);

    if (!throttledValueChangedDispatch) {
        throttledValueChangedDispatch = _.throttle((attribute2, value) => {
            dispatch(attributeValueChangedAction(attribute2, value));
        }, 500);
    }

    throttledValueChangedDispatch(attribute, attribute.value);
}

function LonConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams) {
    if (getState().app.adapter.autoConnUpdate === true) {
        const connParams = {
            ...requestedConnectionParams,
            maxConnectionInterval: requestedConnectionParams.minConnectionInterval,
        };
        LupdateDeviceConnectionParams(dispatch, getState, -1, device, connParams);
    } else {
        dispatch(deviceConnParamUpdateRequestAction(device, requestedConnectionParams));
    }
}

function LonConnParamUpdate(dispatch, getState, device, connectionParams) {
    if (device.role === 'central' && !getState().app.adapter.autoConnUpdate) {
        dispatch(deviceConnParamUpdateRequestAction(device, connectionParams));
    }

    dispatch(connectionParamUpdateStatusAction(-1, device, -1));
    dispatch(connectionParamsUpdatedAction(device));
}

function LonAttMtuChanged(dispatch, getState, device, mtu) {
    coreApi.logger.info(`ATT MTU changed, new value is ${mtu}`);
}

function LonSecurityRequest(dispatch, getState, device, params) {
    const state = getState();
    const selectedAdapter = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex]);
    const defaultSecParams = selectedAdapter.security.securityParams;

    if (!defaultSecParams) {
        coreApi.logger.warn('Security request received but security state is undefined');
        return;
    }

    if (selectedAdapter.security.autoAcceptPairing) {
        dispatch(storeSecurityOwnParamsAction(device, defaultSecParams));
        Lauthenticate(dispatch, getState, device, defaultSecParams);
    } else {
        dispatch(securityRequestAction(device, params));
    }
}

function LonSecParamsRequest(dispatch, getState, device, peerParams) {
    const state = getState();
    const selectedAdapter = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex]);
    const defaultSecParams = selectedAdapter.security.securityParams;

    const adapterToUse = getState().app.adapter.api.selectedAdapter;

    dispatch(storeSecurityPeerParamsAction(device, peerParams));

    secKeyset.keys_own.pk = { pk: adapterToUse.computePublicKey() };

    if (device.role === 'central') {
        if (device.ownPeriphInitiatedPairingPending) {
            // If pairing initiated by own peripheral, proceed directly with replySecParams
            let periphInitSecParams = getState().app.adapter.getIn(['adapters', getState().app.adapter.selectedAdapterIndex,
                'security', 'connectionsSecParameters', device.address, 'ownParams',
            ]);

            if (!periphInitSecParams) {
                coreApi.logger.info('Could not retrieve stored security params, using default params');
                periphInitSecParams = defaultSecParams;
            }

            adapterToUse.replySecParams(device.instanceId, 0, periphInitSecParams, secKeyset,
                error => {
                    if (error) {
                        coreApi.logger.warn(`Error when calling replySecParams: ${error}`);
                        dispatch(deviceAuthErrorOccuredAction(device));
                    }

                    coreApi.logger.debug(`ReplySecParams, secParams: ${periphInitSecParams}`);
                    dispatch(storeSecurityOwnParamsAction(device, periphInitSecParams));
                },
            );
        } else if (selectedAdapter.security.autoAcceptPairing) {
            LacceptPairing(dispatch, getState, -1, device, defaultSecParams);
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
                coreApi.logger.warn(`Error when calling replySecParams: ${error}`);
                dispatch(deviceAuthErrorOccuredAction(device));
            }

            coreApi.logger.debug('ReplySecParams, secParams: null');
        });
    }
}

function LonSecInfoRequest(dispatch, getState, device) {
    const adapterToUse = getState().app.adapter.api.selectedAdapter;

    const bondInfo = getState().app.adapter.getIn(['adapters', getState().app.adapter.selectedAdapterIndex, 'security', 'bondStore', device.address]);

    let encInfo;
    let idInfo;

    if (bondInfo) {
        encInfo = bondInfo.getIn(['keys_own', 'enc_key', 'enc_info']).toJS();
        idInfo = bondInfo.getIn(['keys_own', 'id_key', 'id_info']).toJS();
    } else {
        coreApi.logger.info(`Peer requested encryption, but no keys are found for address ${device.address}`);
        encInfo = null;
        idInfo = null;
    }

    adapterToUse.secInfoReply(device.instanceId, encInfo, idInfo, null, error => {
        if (error) {
            coreApi.logger.warn(`Error when calling secInfoReply: ${error}`);
            dispatch(deviceAuthErrorOccuredAction(device));
        }

        coreApi.logger.debug(`SecInfoReply, ${JSON.stringify(encInfo)}, ${JSON.stringify(idInfo)}`);
    });
}

function LonAuthKeyRequest(dispatch, getState, device, keyType) {
    // TODO: add if enableKeypress shall be sent
    // Find sec params info regarding if keypress notification shall be sent
    const secParameters = getState().app.adapter.getIn(['adapters', getState().app.adapter.selectedAdapterIndex, 'security', 'connectionsSecParameters', device.address]);
    const sendKeypress2 = secParameters.peerParams.keypress === true
        && secParameters.ownParams.keypress === true;

    dispatch(authKeyRequestAction(device, keyType, sendKeypress2));
}

function LonPasskeyDisplay(dispatch, getState, device, matchRequest, passkey) {
    const secParameters = getState().app.adapter.getIn(['adapters', getState().app.adapter.selectedAdapterIndex, 'security', 'connectionsSecParameters', device.address]);
    const receiveKeypress = secParameters.peerParams.keypress === true
        && secParameters.ownParams.keypress === true;
    dispatch(passkeyDisplayAction(device, matchRequest, passkey, receiveKeypress));
}

function LonLescDhkeyRequest(dispatch, getState, device, peerPublicKey, oobdRequired) {
    const adapterToUse = getState().app.adapter.api.selectedAdapter;

    const dhKey = adapterToUse.computeSharedSecret(peerPublicKey);

    adapterToUse.replyLescDhkey(device.instanceId, dhKey, error => {
        if (error) {
            coreApi.logger.warn('Error when sending LESC DH key');
            dispatch(deviceAuthErrorOccuredAction(device));
        }
    });

    const publicKey = adapterToUse.computePublicKey();
    adapterToUse.getLescOobData(device.instanceId, publicKey, (error, ownOobData) => {
        if (error) {
            coreApi.logger.warn(`Error in getLescOobData: ${error.message}`);
            dispatch(deviceAuthErrorOccuredAction(device));
            return;
        }

        coreApi.logger.debug(`Own OOB data: ${JSON.stringify(ownOobData)}`);

        if (oobdRequired) {
            dispatch(lescOobRequestAction(device, ownOobData));
        }
    });
}

function LonKeyPressed(dispatch, getState, device, keypressType) {
    dispatch(keypressReceivedAction(device, keypressType));
}

function LonAuthStatus(dispatch, getState, device, params) {
    if (params.auth_status !== 0) {
        coreApi.logger.warn(`Authentication failed with status ${params.auth_status_name}`);
        dispatch(deviceAuthErrorOccuredAction(device));
        return;
    }

    dispatch(deviceAuthSuccessOccuredAction(device));

    if (!(params.keyset && params.keyset.keys_own && params.keyset.keys_own.pk &&
          params.keyset.keys_own.enc_key && params.keyset.keys_own.id_key)) {
        return;
    }

    if (!params.bonded) {
        coreApi.logger.debug('No bonding performed, do not store keys');
        return;
    }

    dispatch(addBondInfo(device, params));
}

function Lauthenticate(dispatch, getState, device, securityParams) {
    const adapterToUse = getState().app.adapter.api.selectedAdapter;

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

function LonLogMessage(severity, message) {
    switch (severity) {
        case TRACE:
        case DEBUG:
            coreApi.logger.debug(message);
            break;
        case INFO:
            coreApi.logger.info(message);
            break;
        case WARNING:
            coreApi.logger.warn(message);
            break;
        case ERROR:
        case FATAL:
            coreApi.logger.error(message);
            break;
        default:
            coreApi.logger.warn(`Log message of unknown severity ${severity} received: ${message}`);
    }
}

function LonStatus(dispatch, getState, status, adapterToUse) {
    if (adapterToUse === undefined || adapterToUse === null) {
        coreApi.logger.error('Received status callback, but adapter is not selected yet.');
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
        LenableBLE(dispatch, adapterToUse);
    } else {
        coreApi.logger.error(`Received status with code ${status.id} ${status.name}, message: '${status.message}'`);
    }
}

function LenableBLE(dispatch, adapter) {
    // Adapter has been through state RESET and has now transitioned to
    // CONNECTION_ACTIVE, we now need to enable the BLE stack
    if (!adapter) {
        coreApi.logger.error('Trying to enable BLE, but adapter not provided.');
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
        coreApi.logger.debug('SoftDevice BLE stack enabled.');
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LcloseAdapter(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const adapter = getState().app.adapter.api.selectedAdapter;
        adapter.close(error => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve(adapter);
            }
        });
    }).then(adapter2 => {
        dispatch(adapterClosedAction(adapter2));
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LupdateDeviceConnectionParams(dispatch, getState, id, device, connectionParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        adapterToUse.updateConnectionParameters(
            device.instanceId,
            connectionParams,
            (error, device2) => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve(device2);
                }
            },
        );
    }).then(device2 => {
        dispatch(connectionParamUpdateStatusAction(id, device2, BLEEventState.SUCCESS));
    }).catch(error => {
        dispatch(connectionParamUpdateStatusAction(id, device, BLEEventState.ERROR));
        dispatch(showErrorDialog(error));
    });
}

function LrejectConnectionParams(dispatch, getState, id, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

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
    });
}

function LrejectPairing(dispatch, getState, id, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

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
    });
}

function LreplyAuthKey(dispatch, getState, id, device, keyType, key) {
    const adapterToUse = getState().app.adapter.api.selectedAdapter;
    const driver = adapterToUse.driver;

    if (adapterToUse === null) {
        dispatch(showErrorDialog(new Error('No adapter selected!')));
    }

    // Check if we shall send keypressEnd based
    // on keypressStart has been sent previously
    const sendKeypress2 = getState().app.bleEvent.getIn(
        [
            'events',
            id,
            'keypressStartSent',
        ],
    );

    return new Promise((resolve, reject) => {
        if (sendKeypress2 === true) {
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
        if (sendKeypress2 === true) {
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

function LreplyLescOob(dispatch, getState, id, device, peerOob, ownOobData) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;
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

        coreApi.logger.debug(`setLescOobData, ownOobData: ${JSON.stringify(ownOobData)}, peerOobData: ${JSON.stringify(peerOobData)}`);

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
    });
}

function LsendKeypress(dispatch, getState, eventId, device, keypressType) {
    const adapterToUse = getState().app.adapter.api.selectedAdapter;
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
}

function LacceptPairing(dispatch, getState, id, device, securityParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected!'));
        }

        secKeyset.keys_own.pk = { pk: adapterToUse.computePublicKey() };

        if (device.role === 'peripheral') {
            adapterToUse.authenticate(device.instanceId, securityParams, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                coreApi.logger.debug(`Authenticate, secParams: ${securityParams}`);
                resolve();
            });
        } else if (device.role === 'central') {
            adapterToUse.replySecParams(device.instanceId, 0, securityParams, secKeyset, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                coreApi.logger.debug(`ReplySecParams, secParams: ${JSON.stringify(securityParams)}, secKeyset: ${JSON.stringify(secKeyset)}`);
                resolve();
            });
        } else {
            reject(new Error('Unknown role'));
        }
    }).then(() => {
        dispatch(storeSecurityOwnParamsAction(device, securityParams));
        dispatch(pairingStatusAction(id, device, BLEEventState.PENDING));
    }).catch(() => {
        dispatch(pairingStatusAction(id, device, BLEEventState.ERROR));
    });
}

function LpairWithDevice(dispatch, getState, id, device, securityParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (!adapterToUse) {
            reject(new Error('No adapter selected!'));
        }

        adapterToUse.authenticate(device.instanceId, securityParams, error => {
            if (error) {
                reject(new Error(error.message));
            }

            coreApi.logger.debug(`Authenticate, secParams: ${securityParams}`);
            resolve();
        });
    }).then(() => {
        dispatch(storeSecurityOwnParamsAction(device, securityParams));
        dispatch(pairingStatusAction(id, device, BLEEventState.PENDING));
    }).catch(error => {
        dispatch(pairingStatusAction(id, device, BLEEventState.ERROR));
        dispatch(showErrorDialog(error));
    });
}

function LconnectToDevice(dispatch, getState, device) {
    const adapterToUse = getState().app.adapter.api.selectedAdapter;
    const onCompleted = () => {
        Promise.resolve(adapterToUse);
    };

    return new Promise((resolve, reject) => {
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

        // We add these two so that we are able to resolve this promise if
        // the device connects or the connection attempt times out. If we do
        // not resolve the promise we may get a memory leak.
        adapterToUse.once('deviceConnected', onCompleted);
        adapterToUse.once('connectTimedOut', onCompleted);

        adapterToUse.connect(
            { address: device.address, type: device.addressType },
            options,
            error => {
                if (error) {
                    reject(new Error(error.message));
                }
            },
        );
    }).catch(error => {
        dispatch(showErrorDialog(error));
    }).then(adapterToUse2 => {
        adapterToUse2.removeListener('deviceConnected', onCompleted);
        adapterToUse2.removeListener('connectTimedOut', onCompleted);
    });
}

function LdisconnectFromDevice(dispatch, getState, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        adapterToUse.disconnect(device.instanceId, (error, device2) => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve(device2);
            }
        });
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LcancelConnect(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

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
    });
}

export function findAdapters() {
    return (dispatch, getState, { bleDriver }) => LgetAdapters(dispatch, getState, bleDriver);
}

export function openAdapter(port, versionInfo) {
    return (dispatch, getState, { SerialPort }) =>
        LopenAdapter(dispatch, getState, port, versionInfo, SerialPort);
}

export function closeAdapter() {
    return (dispatch, getState) => LcloseAdapter(dispatch, getState);
}

export function connectToDevice(device) {
    return (dispatch, getState) => LconnectToDevice(dispatch, getState, device);
}

export function disconnectFromDevice(device) {
    return (dispatch, getState) => LdisconnectFromDevice(dispatch, getState, device);
}

export function pairWithDevice(id, device, securityParams) {
    return (dispatch, getState) => LpairWithDevice(dispatch, getState, id, device, securityParams);
}

export function acceptPairing(id, device, securityParams) {
    return (dispatch, getState) => LacceptPairing(dispatch, getState, id, device, securityParams);
}

export function rejectPairing(id, device) {
    return (dispatch, getState) => LrejectPairing(dispatch, getState, id, device);
}

export function replyNumericalComparisonMatch(id, device, match) {
    return (dispatch, getState) => {
        if (match) {
            return LreplyAuthKey(dispatch, getState, id, device, 'BLE_GAP_AUTH_KEY_TYPE_PASSKEY', null);
        }
        return LreplyAuthKey(dispatch, getState, id, device, 'BLE_GAP_AUTH_KEY_TYPE_NONE', null);
    };
}

export function replyAuthKey(id, device, keyType, key) {
    return (dispatch, getState) => LreplyAuthKey(dispatch, getState, id, device, keyType, key);
}

export function replyLescOob(id, device, peerOobData, ownOobData) {
    return (dispatch, getState) => LreplyLescOob(
        dispatch, getState, id, device, peerOobData, ownOobData,
    );
}

export function sendKeypress(id, device, keypressType) {
    return (dispatch, getState) => LsendKeypress(dispatch, getState, id, device, keypressType);
}

export function cancelConnect() {
    return (dispatch, getState) => LcancelConnect(dispatch, getState);
}

export function updateDeviceConnectionParams(id, device, connectionParams) {
    return (dispatch, getState) => LupdateDeviceConnectionParams(
        dispatch, getState, id, device, connectionParams,
    );
}

export function rejectDeviceConnectionParams(id, device) {
    return (dispatch, getState) => LrejectConnectionParams(dispatch, getState, id, device);
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
