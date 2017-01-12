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

import _ from 'underscore';
import semver from 'semver';
import os from 'os';
import { SerialPort } from 'serialport';
import { api } from 'pc-ble-driver-js';
import { logger } from '../logging';
import { discoverServices } from './deviceDetailsActions';
import { BLEEventState } from './common';
import { showErrorDialog } from './errorDialogActions';
import { showFirmwareUpdateRequest } from './firmwareUpdateActions';
import { hexStringToArray, toHexString } from '../utils/stringUtil';

import { DebugProbe } from 'pc-nrfjprog-js';

const _adapterFactory = api.AdapterFactory.getInstance();

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

const attrChange = {
    lastAttrChangeTime: process.hrtime(),
    numAttrChanged: 0,
    lastAttrHandleChanged: 0,
};

let throttledValueChangedDispatch;

const latestFirmwareVersion = '1.1.0';

// Internal functions

function _getAdapters(dispatch) {
    return new Promise((resolve, reject) => {
        // Register listeners for adapters added/removed
        _adapterFactory.removeAllListeners();
        _adapterFactory.on('added', adapter => {
            dispatch(adapterAddedAction(adapter));
        });
        _adapterFactory.on('removed', adapter => {
            dispatch(adapterRemovedAction(adapter));
        });
        _adapterFactory.on('error', error => {
            dispatch(showErrorDialog(new Error(error.message)));
        });

        _adapterFactory.getAdapters((error, adapters) => {
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

function _setupListeners(dispatch, getState, adapterToUse) {
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

    adapterToUse.on('logMessage', _onLogMessage);

    // Listen to adapter changes
    adapterToUse.on('stateChanged', state => {
        dispatch(adapterStateChangedAction(adapterToUse, state));
    });

    adapterToUse.on('deviceDiscovered', device => {
        _handleDeviceEvent(device, getState, () => {
            dispatch(deviceDiscoveredAction(device));
        });
    });

    adapterToUse.on('deviceConnected', device => {
        _handleDeviceEvent(device, getState, () => {
            _onDeviceConnected(dispatch, getState, device);
        });
    });

    adapterToUse.on('deviceDisconnected', (device, reason) => {
        _handleDeviceEvent(device, getState, () => {
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
        _handleDeviceEvent(device, getState, () => {
            dispatch(deviceSecurityRequestTimedOutAction(device));
        });
    });

    adapterToUse.on('connParamUpdateRequest', (device, requestedConnectionParams) => {
        _handleDeviceEvent(device, getState, () => {
            _onConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams);
        });
    });

    adapterToUse.on('connParamUpdate', (device, connectionParams) => {
        _handleDeviceEvent(device, getState, () => {
            _onConnParamUpdate(dispatch, getState, device, connectionParams);
        });
    });

    adapterToUse.on('attMtuChanged', (device, mtu) => {
        _handleDeviceEvent(device, getState, () => {
            _onAttMtuChanged(dispatch, getState, device, mtu);
        });
    });

    adapterToUse.on('characteristicValueChanged', characteristic => {
        _onAttributeValueChanged(dispatch, getState, characteristic, characteristic.valueHandle);
    });

    adapterToUse.on('descriptorValueChanged', descriptor => {
        _onAttributeValueChanged(dispatch, getState, descriptor, descriptor.handle);
    });

    adapterToUse.on('securityChanged', (device, connectionSecurity) => {
        _handleDeviceEvent(device, getState, () => {
            dispatch(securityChangedAction(device, connectionSecurity));
        });
    });

    adapterToUse.on('securityRequest', (device, params) => {
        _handleDeviceEvent(device, getState, () => {
            _onSecurityRequest(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('secParamsRequest', (device, peerParams) => {
        _handleDeviceEvent(device, getState, () => {
            _onSecParamsRequest(dispatch, getState, device, peerParams);
        });
    });

    adapterToUse.on('secInfoRequest', (device, params) => {
        _handleDeviceEvent(device, getState, () => {
            _onSecInfoRequest(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('authKeyRequest', (device, keyType) => {
        _handleDeviceEvent(device, getState, () => {
            _onAuthKeyRequest(dispatch, getState, device, keyType);
        });
    });

    adapterToUse.on('passkeyDisplay', (device, matchRequest, passkey) => {
        _handleDeviceEvent(device, getState, () => {
            _onPasskeyDisplay(dispatch, getState, device, matchRequest, passkey);
        });
    });

    adapterToUse.on('lescDhkeyRequest', (device, peerPublicKey, oobDataRequired) => {
        _handleDeviceEvent(device, getState, () => {
            _onLescDhkeyRequest(dispatch, getState, device, peerPublicKey, oobDataRequired);
        });
    });

    adapterToUse.on('keyPressed', (device, keypressType) => {
        _handleDeviceEvent(device, getState, () => {
            _onKeyPressed(dispatch, getState, device, keypressType);
        });
    });

    adapterToUse.on('authStatus', (device, params) => {
        _handleDeviceEvent(device, getState, () => {
            _onAuthStatus(dispatch, getState, device, params);
        });
    });

    adapterToUse.on('status', status => {
        _onStatus(dispatch, getState, status);
    });
}

function _handleDeviceEvent(device, getState, handleFn) {
    if (!getState().adapter.ignoredDeviceAddresses.has(device.address)) {
        handleFn();
    }
}

function _checkVersion(version) {
    if (!version) {
        return false;
    }

    // Require higher than or equal to version, but disallow increment in major version number
    const versionRule = '^' + latestFirmwareVersion;
    if (!semver.satisfies(version, versionRule)) {
        return false;
    }

    return true;
}

function _checkProgram(dispatch, getState, adapter) {
    return new Promise((resolve, reject) => {
        // Check if we already have an adapter open, if so, close it
        if (getState().adapter.api.selectedAdapter === null) {
            resolve();
            return;
        }

        _closeAdapter(dispatch, getState().adapter.api.selectedAdapter).then(() => {
            resolve();
        }).catch(error => {
            reject(error);
        });
    }).then(() => {
        return _validatePort(dispatch, getState, adapter);
    }).then(adapterToUse => {
        const serialNumber = parseInt(adapterToUse.state.serialNumber, 10);
        return _getVersion(dispatch, getState, adapter, serialNumber);
    }).then(versionInfo => {
        return _openAdapter(dispatch, getState, adapter, versionInfo);
    }).catch(err => {
        if (err) {
            dispatch(showErrorDialog(err));
        }
    });
}

function _validatePort(dispatch, getState, adapter) {
    const adapterToUse = getState().adapter.api.adapters.find(x => { return x.state.port === adapter; });

    return new Promise((resolve, reject) => {
        if (adapterToUse === null) {
            reject(new Error(`Not able to find ${adapter}.`));
        }

        const port = new SerialPort(adapter, {}, false);

        port.open(err => {
            if (err) {
                reject(new Error(`Could not open the port. Please power cycle the device and try again.`));
                logger.debug(`Serial port error: ${err}`);
                return;
            }

            resolve(port);

        });
    }).then(port => {
        return new Promise((resolve, reject) => {
            port.close(err => {
                if (err) {
                    reject();
                    logger.debug(`Serial port error: ${err}`);
                    return;
                }

                resolve();
            });
        });
    }).then(() => {
        return adapterToUse;
    });
}

function _getVersion(dispatch, getState, adapter, serialNumber) {
    return new Promise((resolve, reject) => {
        const probe = new DebugProbe();

        probe.getVersion(serialNumber, (err, version) => {
            setTimeout(() => {
                if (err && err.errcode === 'CouldNotLoadDLL') {
                    logger.info('Could not load nrfjprog DLL, firmware detection and programming will not be available.');
                    // Don't proceed if we were not able to read out the version
                    resolve();
                    return;
                } else if (err && (err.errcode === 'CouldNotConnectToDevice' || err.errcode === 'CouldNotOpenDevice')) {
                    logger.info('Could not connect to debug probe, firmware detection and programming will not be available.');
                    resolve();
                    return;
                } else if (err && err.errcode !== 'WrongMagicNumber') { // Wrong Magic Number is not an actual error for us, so we should continue execution
                    logger.info('Could not connect to debug probe, firmware detection and programming will not be available.');
                    resolve();
                    return;
                }

                const versionString = version ? semver.clean(version.string) : null;

                if (!_checkVersion(versionString)) {
                    dispatch(showFirmwareUpdateRequest(adapter, versionString, latestFirmwareVersion));
                    reject();
                } else {
                    logger.info(`Connectivity firmware version ${versionString} detected`);
                    logger.debug(`Connectivity firmware info: sdBleApiVersion: ${version.sdBleApiVersion}, baudRate: ${version.baudRate}, transportType: ${version.transportType}`);
                    resolve(version);
                }
            }, 500);
        });
    });
}

function _getBaudRate(versionInfo) {
    const defaultBaudRate = os.type() === 'Darwin' ? 115200 : 1000000;

    if (!versionInfo || !versionInfo.baudRate) {
        return defaultBaudRate;
    }

    if (versionInfo.baudRate < 0 && versionInfo.baudRate > 1000000) {
        return defaultBaudRate;
    }

    return versionInfo.baudRate;
}

function _openAdapter(dispatch, getState, adapter, versionInfo) {
    return new Promise((resolve, reject) => {
        // Check if we already have an adapter open, if so, close it
        if (getState().adapter.api.selectedAdapter !== null) {
            _closeAdapter(dispatch, getState().adapter.api.selectedAdapter).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        } else {
            resolve();
        }
    }).then(() => {
        const baudRate = _getBaudRate(versionInfo);
        return Promise.resolve(baudRate);
    }).then(baudRate => {
        return new Promise((resolve, reject) => {
            const options = {
                baudRate: baudRate,
                parity: 'none',
                flowControl: 'none',
                eventInterval: 10,
                logLevel: 'debug',
                enableBLE: false,
            };

            const adapterToUse = getState().adapter.api.adapters.find(x => { return x.state.port === adapter; });

            if (adapterToUse === null) {
                reject(new Error(`Not able to find ${adapter}.`));
                return;
            }

            getState().adapter.api.selectedAdapter = adapterToUse;

            dispatch(adapterOpenAction(adapterToUse));

            _setupListeners(dispatch, getState, adapterToUse);

            adapterToUse.open(options, error => {
                if (error) {
                    reject(error); // Let the error event inform the user about the error.
                } else {
                    resolve(adapterToUse);
                }
            });
        }).then(adapter => {
            dispatch(adapterOpenedAction(adapter));
        });
    }).catch(error => {
        getState().adapter.api.selectedAdapter = null;
        // Let the error event inform the user about the error.
    });
}

function _onDeviceConnected(dispatch, getState, device) {
    const adapterToUse = getState().adapter.api.selectedAdapter;

    if (!adapterToUse) {
        logger.warn('No adapter');
        return;
    }

    const bondInfo = getState().adapter.getIn(['adapters', getState().adapter.selectedAdapter, 'security', 'bondStore', device.address]);

    if (device.role === 'peripheral' && bondInfo) {
        const isLesc = bondInfo.getIn(['keys_own', 'enc_key', 'enc_info', 'lesc']);

        let encInfo;
        let masterId;

        if (isLesc)
        {
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

function _onAttributeValueChanged(dispatch, getState, attribute, handle) {
    let val;
    if (Array.isArray(attribute.value)) {
        val = attribute.value;
    } else if (attribute.value) {
        val = attribute.value[Object.keys(attribute.value)[0]];
    }

    logger.info(`Attribute value changed, handle: 0x${toHexString(handle)}, value (0x): ${toHexString(val)}`);

    if (!throttledValueChangedDispatch) {
        throttledValueChangedDispatch = _.throttle((attribute, value) => {
            dispatch(attributeValueChangedAction(attribute, value));
        }, 500);
    }

    throttledValueChangedDispatch(attribute, attribute.value);
}

function _onConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams) {
    if (getState().adapter.autoConnUpdate === true) {
        requestedConnectionParams.maxConnectionInterval = requestedConnectionParams.minConnectionInterval;
        _updateDeviceConnectionParams(dispatch, getState, -1, device, requestedConnectionParams);
    } else {
        dispatch(deviceConnParamUpdateRequestAction(device, requestedConnectionParams));
    }
}

function _onConnParamUpdate(dispatch, getState, device, connectionParams) {
    if (device.role === 'central' && !getState().adapter.autoConnUpdate) {
        dispatch(deviceConnParamUpdateRequestAction(device, connectionParams));
    }

    dispatch(connectionParamUpdateStatusAction(-1, device, -1));
    dispatch(connectionParamsUpdatedAction(device));
}

function _onAttMtuChanged(dispatch, getState, device, mtu) {
    logger.info(`ATT MTU changed, new value is ${mtu}`);
}

function _onSecurityRequest(dispatch, getState, device, params) {
    const state = getState();
    const selectedAdapter = state.adapter.getIn(['adapters', state.adapter.selectedAdapter]);
    const defaultSecParams = selectedAdapter.security.securityParams;

    if (!defaultSecParams) {
        logger.warn('Security request received but security state is undefined');
        return;
    }

    if (selectedAdapter.security.autoAcceptPairing) {
        dispatch(storeSecurityOwnParamsAction(device, defaultSecParams));
        _authenticate(dispatch, getState, device, defaultSecParams);
    } else {
        dispatch(securityRequestAction(device, params));
    }
}

function _onSecParamsRequest(dispatch, getState, device, peerParams) {
    const state = getState();
    const selectedAdapter = state.adapter.getIn(['adapters', state.adapter.selectedAdapter]);
    const defaultSecParams = selectedAdapter.security.securityParams;

    const adapterToUse = getState().adapter.api.selectedAdapter;

    dispatch(storeSecurityPeerParamsAction(device, peerParams));

    secKeyset.keys_own.pk = { pk: adapterToUse.computePublicKey() };

    if (device.role === 'central') {
        if (device.ownPeriphInitiatedPairingPending) {
            // If pairing initiated by own peripheral, proceed directly with replySecParams
            let periphInitSecParams = getState().adapter.getIn(['adapters', getState().adapter.selectedAdapter,
                'security', 'connectionsSecParameters', device.address, 'ownParams',
                ]);

            if (!periphInitSecParams) {
                logger.info(`Could not retrieve stored security params, using default params`);
                periphInitSecParams = defaultSecParams;
            }

            adapterToUse.replySecParams(device.instanceId, 0, periphInitSecParams, secKeyset, error => {
                if (error) {
                    logger.warn(`Error when calling replySecParams: ${error}`);
                    dispatch(deviceAuthErrorOccuredAction(device));
                }

                logger.debug(`ReplySecParams, secParams: ${periphInitSecParams}`);
                dispatch(storeSecurityOwnParamsAction(device, periphInitSecParams));
            });
        } else {
            if (selectedAdapter.security.autoAcceptPairing) {
                _acceptPairing(dispatch, getState, -1, device, defaultSecParams);
            } else {
                const secParams = {
                    bond: peerParams.bond,
                    mitm: peerParams.mitm,
                    lesc: peerParams.lesc,
                    keypress: peerParams.keypress,
                };
                dispatch(securityRequestAction(device, secParams));
            }
        }
    } else if (device.role === 'peripheral') {
        adapterToUse.replySecParams(device.instanceId, 0, null, secKeyset, error => {
            if (error) {
                logger.warn(`Error when calling replySecParams: ${error}`);
                dispatch(deviceAuthErrorOccuredAction(device));
            }

            logger.debug(`ReplySecParams, secParams: null`);
        });
    }
}

function _onSecInfoRequest(dispatch, getState, device, params) {
    const adapterToUse = getState().adapter.api.selectedAdapter;

    const bondInfo = getState().adapter.getIn(['adapters', getState().adapter.selectedAdapter, 'security', 'bondStore', device.address]);

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

function _onAuthKeyRequest(dispatch, getState, device, keyType) {
    // TODO: add if enableKeypress shall be sent
    // Find sec params info regarding if keypress notification shall be sent
    const secParameters = getState().adapter.getIn(['adapters', getState().adapter.selectedAdapter, 'security', 'connectionsSecParameters', device.address]);
    const sendKeypress = secParameters.peerParams.keypress === true && secParameters.ownParams.keypress === true;

    dispatch(authKeyRequestAction(device, keyType, sendKeypress));
}

function _onPasskeyDisplay(dispatch, getState, device, matchRequest, passkey) {
    const secParameters = getState().adapter.getIn(['adapters', getState().adapter.selectedAdapter, 'security', 'connectionsSecParameters', device.address]);
    const receiveKeypress = secParameters.peerParams.keypress === true && secParameters.ownParams.keypress === true;
    dispatch(passkeyDisplayAction(device, matchRequest, passkey, receiveKeypress));
}

function _onLescDhkeyRequest(dispatch, getState, device, peerPublicKey, oobdRequired) {
    const adapterToUse = getState().adapter.api.selectedAdapter;

    const dhKey = adapterToUse.computeSharedSecret(peerPublicKey);

    adapterToUse.replyLescDhkey(device.instanceId, dhKey, error => {
        if (error) {
            logger.warn(`Error when sending LESC DH key`);
            dispatch(deviceAuthErrorOccuredAction(device));
            return;
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

function _onKeyPressed(dispatch, getState, device, keypressType) {
    dispatch(keypressReceivedAction(device, keypressType));
}

function _onAuthStatus(dispatch, getState, device, params) {
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

function _authenticate(dispatch, getState, device, securityParams) {
    const adapterToUse = getState().adapter.api.selectedAdapter;

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

function _onLogMessage(severity, message) {
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

function _onStatus(dispatch, getState, status) {
    const adapterToUse = getState().adapter.api.selectedAdapter;

    if (adapterToUse === undefined || adapterToUse === null) {
        logger.error('Received status callback, but adapter is not selected yet.');
        return;
    }

    // Check if it is a reset performed status and if selectedAdapter is set.
    // selectedAdapter is set in the immutable state of the application after the adapter has been successfully opened.
    if (status.name === 'RESET_PERFORMED') {
        if (adapterToUse) {
            dispatch(adapterResetPerformedAction(adapterToUse));
        }
    } else if (status.name === 'CONNECTION_ACTIVE') {
        _enableBLE(dispatch, adapterToUse);
    } else {
        logger.error(`Received status with code ${status.id} ${status.name}, message: '${status.message}'`);
    }
}

function _enableBLE(dispatch, adapter) {
    // Adapter has been through state RESET and has now transitioned to CONNECTION_ACTIVE, we now need to enable the BLE stack
    if (!adapter) {
        logger.error('Trying to enable BLE, but adapter not provided.');
        return;
    }

    return new Promise((resolve, reject) => {
        adapter.enableBLE(null, error => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve();
            }
        });
    }).then(() => {
        // Initiate fetching of adapter state, let API emit state changes
        return new Promise((resolve, reject) => {
            adapter.getState(error => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve();
                }
            });
        });
    }).then(() => {
        logger.debug('SoftDevice BLE stack enabled.');
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function _closeAdapter(dispatch, adapter) {
    return new Promise((resolve, reject) => {
        adapter.close(error => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve(adapter);
            }
        });
    }).then(adapter => {
        dispatch(adapterClosedAction(adapter));
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function _updateDeviceConnectionParams(dispatch, getState, id, device, connectionParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        adapterToUse.updateConnectionParameters(device.instanceId, connectionParams, (error, device) => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve(device);
            }
        });
    }).then(device => {
        dispatch(connectionParamUpdateStatusAction(id, device, BLEEventState.SUCCESS));
    }).catch(error => {
        dispatch(connectionParamUpdateStatusAction(id, device, BLEEventState.ERROR));
        dispatch(showErrorDialog(error));
    });
}

function _rejectConnectionParams(dispatch, getState, id, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

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

function _rejectPairing(dispatch, getState, id, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

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
            adapterToUse.replySecParams(device.instanceId, PAIRING_NOT_SUPPORTED, null, null, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                resolve();
            });
        } else {
            reject(new Error('Invalid role'));
        }
    }).then(() => {
        dispatch(pairingStatusAction(id, device, BLEEventState.REJECTED));
    }).catch(() => {
        dispatch(pairingStatusAction(id, device, BLEEventState.ERROR));
    });
}

function _replyAuthKey(dispatch, getState, id, device, keyType, key) {
    const adapterToUse = getState().adapter.api.selectedAdapter;
    const driver = adapterToUse.driver;

    if (adapterToUse === null) {
        dispatch(showErrorDialog(new Error('No adapter selected!')));
    }

    // Check if we shall send keypressEnd based
    // on keypressStart has been sent previously
    const sendKeypress = getState().bleEvent.getIn(
        [
            'events',
            id,
            'keypressStartSent',
        ]
    );

    return new Promise((resolve, reject) => {
        if (sendKeypress === true) {
            adapterToUse.notifyKeypress(device.instanceId, driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_END, error => {
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
        if (sendKeypress === true) {
            dispatch(keypressSentAction(id, device, 'BLE_GAP_KP_NOT_TYPE_PASSKEY_END'));
        }

        return new Promise((resolve, reject) => {
            const keyTypeInt = (keyType === 'BLE_GAP_AUTH_KEY_TYPE_PASSKEY') ? 1
                : (keyType === 'BLE_GAP_AUTH_KEY_TYPE_OOB') ? 2
                : 0;

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

function _replyLescOob(dispatch, getState, id, device, peerOob, ownOobData) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;
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
    });
}

function _sendKeypress(dispatch, getState, eventId, device, keypressType) {
    const adapterToUse = getState().adapter.api.selectedAdapter;
    const driver = adapterToUse.driver;

    const keypressStartSent = getState().bleEvent.getIn(
        [
            'events',
            eventId,
            'keypressStartSent',
        ]);

    if (adapterToUse === null) {
        dispatch(showErrorDialog('No adapter selected!'));
        return;
    }

    return new Promise((resolve, reject) => {
        if (keypressStartSent !== true) {
            adapterToUse.notifyKeypress(device.instanceId, driver.BLE_GAP_KP_NOT_TYPE_PASSKEY_START, error => {
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

function _acceptPairing(dispatch, getState, id, device, securityParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

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
            adapterToUse.replySecParams(device.instanceId, 0, securityParams, secKeyset, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                logger.debug(`ReplySecParams, secParams: ${JSON.stringify(securityParams)}, secKeyset: ${JSON.stringify(secKeyset)}`);
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

function _pairWithDevice(dispatch, getState, id, device, securityParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

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
    });
}

function _connectToDevice(dispatch, getState, device) {
    const adapterToUse = getState().adapter.api.selectedAdapter;
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
            }
        );
    }).catch(error => {
        dispatch(showErrorDialog(error));
    }).then(adapterToUse => {
        adapterToUse.removeListener('deviceConnected', onCompleted);
        adapterToUse.removeListener('connectTimedOut', onCompleted);
    });
}

function _disconnectFromDevice(dispatch, getState, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        adapterToUse.disconnect(device.instanceId, (error, device) => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve(device);
            }
        });
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function _cancelConnect(dispatch, getState) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error(`No adapter selected`));
            return;
        }

        dispatch(deviceCancelConnectAction());

        adapterToUse.cancelConnect(error => {
            if (error) {
                reject(new Error(error.message));
            }

            resolve();
        });
    }).then(device => {
        dispatch(deviceConnectCanceledAction());
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function adapterOpenedAction(adapter)
{
    return {
        type: ADAPTER_OPENED,
        adapter,
    };
}

function adapterOpenAction(adapter)
{
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
        id: id,
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

function authKeyRequestAction(device, keyType, sendKeypress) {
    return {
        type: DEVICE_AUTHKEY_REQUEST,
        device,
        keyType,
        sendKeypress,
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

function pairWithDeviceAction(device) {
    return {
        type: DEVICE_INITIATE_PAIRING,
        device,
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

export function findAdapters() {
    return dispatch => {
        return _getAdapters(dispatch);
    };
}

export function programAdapter(adapter) {
    return (dispatch, getState) => {
        return _checkProgram(dispatch, getState, adapter);
    };
}

export function openAdapter(adapter) {
    return (dispatch, getState) => {
        return _openAdapter(dispatch, getState, adapter);
    };
}

export function closeAdapter(adapter) {
    return dispatch => {
        return _closeAdapter(dispatch, adapter);
    };
}

export function connectToDevice(device) {
    return (dispatch, getState) => {
        return _connectToDevice(dispatch, getState, device);
    };
}

export function disconnectFromDevice(device) {
    return (dispatch, getState) => {
        return _disconnectFromDevice(dispatch, getState, device);
    };
}

export function pairWithDevice(id, device, securityParams) {
    return (dispatch, getState) => {
        return _pairWithDevice(dispatch, getState, id, device, securityParams);
    };
}

export function acceptPairing(id, device, securityParams) {
    return (dispatch, getState) => {
        return _acceptPairing(dispatch, getState, id, device, securityParams);
    };
}

export function rejectPairing(id, device) {
    return (dispatch, getState) => {
        return _rejectPairing(dispatch, getState, id, device);
    };
}

export function replyNumericalComparisonMatch(id, device, match) {
    return (dispatch, getState) => {
        if (match) {
            return _replyAuthKey(dispatch, getState, id, device, 'BLE_GAP_AUTH_KEY_TYPE_PASSKEY', null);
        } else {
            return _replyAuthKey(dispatch, getState, id, device, 'BLE_GAP_AUTH_KEY_TYPE_NONE', null);
        }
    };
}

export function replyAuthKey(id, device, keyType, key) {
    return (dispatch, getState) => {
        return _replyAuthKey(dispatch, getState, id, device, keyType, key);
    };
}

export function replyLescOob(id, device, peerOobData, ownOobData) {
    return (dispatch, getState) => {
        return _replyLescOob(dispatch, getState, id, device, peerOobData, ownOobData);
    };
}

export function sendKeypress(id, device, keypressType) {
    return (dispatch, getState) => {
        return _sendKeypress(dispatch, getState, id, device, keypressType);
    };
}

export function cancelConnect() {
    return (dispatch, getState) => {
        return _cancelConnect(dispatch, getState);
    };
}

export function updateDeviceConnectionParams(id, device, connectionParams) {
    return (dispatch, getState) => {
        return _updateDeviceConnectionParams(dispatch, getState, id, device, connectionParams);
    };
}

export function rejectDeviceConnectionParams(id, device) {
    return (dispatch, getState) => {
        return _rejectConnectionParams(dispatch, getState, id, device);
    };
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