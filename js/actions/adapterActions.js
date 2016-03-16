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

export const ADAPTER_OPEN = 'ADAPTER_OPEN';
export const ADAPTER_OPENED = 'ADAPTER_OPENED';
export const ADAPTER_CLOSED = 'ADAPTER_CLOSED';
export const ADAPTER_ADDED = 'ADAPTER_ADDED';
export const ADAPTER_REMOVED = 'ADAPTER_REMOVED';
export const ADAPTER_ERROR = 'ADAPTER_ERROR';
export const ADAPTER_STATE_CHANGED = 'ADAPTER_STATE_CHANGED';
export const ADAPTER_RESET_PERFORMED = 'ADAPTER_RESET_PERFORMED';

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

export const DEVICE_CONNECTION_PARAM_UPDATE_REQUEST = 'DEVICE_CONNECTION_PARAM_UPDATE_REQUEST';
export const DEVICE_CONNECTION_PARAM_UPDATE_STATUS = 'DEVICE_CONNECTION_PARAM_UPDATE_STATUS';
export const DEVICE_TOGGLE_AUTO_CONN_UPDATE = 'DEVICE_TOGGLE_AUTO_CONN_UPDATE';

export const DEVICE_PAIRING_STATUS = 'DEVICE_PAIRING_STATUS';
export const DEVICE_SECURITY_REQUEST = 'DEVICE_SECURITY_REQUEST';

export const ERROR_OCCURED = 'ERROR_OCCURED';

export const ATTRIBUTE_VALUE_CHANGED = 'ADAPTER_ATTRIBUTE_VALUE_CHANGED';

export const TRACE = 0;
export const DEBUG = 1;
export const INFO = 2;
export const WARNING = 3;
export const ERROR = 4;
export const FATAL = 5;

import { driver, api } from 'pc-ble-driver-js';
import { logger } from '../logging';
import { discoverServices } from './deviceDetailsActions';
import { BLEEventState } from './common';
import { showErrorDialog } from './errorDialogActions';

const _adapterFactory = api.AdapterFactory.getInstance();

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

function _openAdapter(dispatch, getState, adapter) {
    return new Promise((resolve, reject) => {
        const options = {
            baudRate: 115200,
            parity: 'none',
            flowControl: 'none',
            eventInterval: 10,
            logLevel: 'debug',
            enableBLE: true,
        };

        // Check if we already have an adapter open, if so, close it
        if (getState().adapter.api.selectedAdapter !== null) {
            _closeAdapter(dispatch, getState().adapter.api.selectedAdapter);
        }

        const adapterToUse = getState().adapter.api.adapters.find(x => { return x.state.port === adapter; });

        if (adapterToUse === null) {
            reject(new Error(`Not able to find ${adapter}.`));
        }

        // Remove all old listeners before adding new ones
        adapterToUse.removeAllListeners();

        // Listen to errors from this adapter since we are opening it now
        adapterToUse.on('error', error => {
            // TODO: separate between what is an non recoverable adapter error
            // TODO: and a recoverable error.
            // TODO: adapterErrorAction should only be used if it is an unrecoverable errors.
            // TODO: errorOccuredAction should be used for recoverable errors.
            dispatch(showErrorDialog(new Error(error.message)));
        });

        adapterToUse.on('logMessage', _onLogMessage);

        // Listen to adapter changes
        adapterToUse.on('stateChanged', state => {
            dispatch(adapterStateChangedAction(adapterToUse, state));
        });

        adapterToUse.on('deviceDiscovered', device => {
            dispatch(deviceDiscoveredAction(device));
        });

        adapterToUse.on('deviceConnected', device => {
            dispatch(deviceConnectedAction(device));
            dispatch(discoverServices(device));
        });

        adapterToUse.on('deviceDisconnected', device => {
            dispatch(deviceDisconnectedAction(device));
        });

        adapterToUse.on('connectTimedOut', deviceAddress => {
            dispatch(deviceConnectTimeoutAction(deviceAddress));
        });

        adapterToUse.on('connParamUpdateRequest', (device, requestedConnectionParams) => {
            _onConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams);
        });

        adapterToUse.on('connParamUpdate', device => {
            _onConnParamUpdate(dispatch, getState, device);
        });

        adapterToUse.on('characteristicValueChanged', characteristic => {
            dispatch(attributeValueChangedAction(characteristic, characteristic.value));
        });

        adapterToUse.on('descriptorValueChanged', descriptor => {
            dispatch(attributeValueChangedAction(descriptor, descriptor.value));
        });

        adapterToUse.on('securityChanged', (device, authParams) => {
            dispatch(securityChangedAction(device, authParams));
        });

        adapterToUse.on('securityRequest', (device, params) => {
            _onSecurityRequest(dispatch, getState, device, params);
        });

        adapterToUse.on('secParamsRequest', (device, params) => {
            _onSecParamsRequest(dispatch, getState, device, params.peerParams);
        });

        adapterToUse.on('status', status => {
            _onStatus(dispatch, getState, status);
        });

        dispatch(adapterOpenAction(adapterToUse));

        adapterToUse.open(options, error => {
            if (error) {
                reject(); // Let the error event inform the user about the error.
            } else {
                resolve(adapterToUse);
            }
        });
    }).then(adapter => {
        return new Promise((resolve, reject) => {
            adapter.getState((error, state) => {
                if (error) {
                    reject(new Error(error.message));
                } else {
                    resolve(adapter);
                }
            });
        });
    }).then(adapter => {
        dispatch(adapterOpenedAction(adapter));
    }).catch(error => {
        if (error) {
            dispatch(showErrorDialog(error));
        }
    });
}

function _onConnParamUpdateRequest(dispatch, getState, device, requestedConnectionParams) {
    if (getState().adapter.autoConnUpdate === true) {
        requestedConnectionParams.maxConnectionInterval = requestedConnectionParams.minConnectionInterval;
        _updateDeviceConnectionParams(dispatch, getState, -1, device, requestedConnectionParams);
    } else {
        dispatch(deviceConnParamUpdateRequestAction(device, requestedConnectionParams));
    }
}

function _onConnParamUpdate(dispatch, getState, device) {
    dispatch(connectionParamUpdateStatusAction(-1, device, -1));
}

function _onSecurityRequest(dispatch, getState, device, params) {
    const state = getState();
    const selectedAdapter = state.adapter.getIn(['adapters', state.adapter.selectedAdapter]);
    const defaultSecParams = selectedAdapter.security.securityParams;

    if (!defaultSecParams) {
        logger.warn('Security request received but security state is undefined');
        return;
    }

    if (false) { //selectedAdapter.security.autoAcceptPairing) {
        _authenticate(dispatch, getState, device, defaultSecParams);
    } else {
        dispatch(securityRequestAction(device));
    }
}

function _onSecParamsRequest(dispatch, getState, device, peerParams) {
    const state = getState();
    const selectedAdapter = state.adapter.getIn(['adapters', state.adapter.selectedAdapter]);
    const defaultSecParams = selectedAdapter.security.securityParams;

    const secKeyset = {
        keys_own: {
            enc_key: {
                enc_info: {
                    ltk: [0, 0, 0, 0, 0, 0, 0, 0],
                    lesc: false,
                    auth: false,
                    ltk_len: 8,
                },
                master_id: {
                    ediv: 0x1234,
                    rand: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                },
            },
            id_key: null,
            sign_key: null,
            pk: null,
        },
        keys_peer: {
            enc_key: {
                enc_info: {
                    ltk: [0, 0, 0, 0, 0, 0, 0, 0],
                    lesc: false,
                    auth: false,
                    ltk_len: 8,
                },
                master_id: {
                    ediv: 0x1234,
                    rand: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                },
            },
            id_key: null,
            sign_key: null,
            pk: null,
        },
    };

    const adapterToUse = getState().adapter.api.selectedAdapter;

    if (device.role === 'central') {
        if (device.ownPeriphInitiatedPairingPending) {
            // If pairing initiated by own peripheral, proceed directly with replySecParams
            adapterToUse.replySecParams(device.instanceId, 0, defaultSecParams, secKeyset, error => {
                if (error) {
                    logger.warn(`Error when calling replySecParams: ${error}`);
                }
            });
        } else {
            if (false) { //selectedAdapter.security.autoAcceptPairing) {
                _authenticate(dispatch, getState, device, defaultSecParams);
            } else {
                dispatch(securityRequestAction(device));
            }
        }
    } else if (device.role === 'peripheral') {
        adapterToUse.replySecParams(device.instanceId, 0, null, secKeyset, error => {
            if (error) {
                logger.warn(`Error when calling replySecParams: ${error}`);
            }
        });
    }
}

function _authenticate(dispatch, getState, device, securityParams) {
    const adapterToUse = getState().adapter.api.selectedAdapter;

    return new Promise((resolve, reject) => {
        adapterToUse.authenticate(device.instanceId, securityParams, error => {
            if (error) {
                reject(new Error(error.message));
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
        return;
    }

    return new Promise((resolve, reject) => {
        adapter.enableBLE(error => {
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

function _acceptPairing(dispatch, getState, id, device, securityParams) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected!'));
        }

        if (device.role === 'peripheral') {
            adapterToUse.authenticate(device.instanceId, securityParams, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                resolve();
            });
        } else if (device.role === 'central') {
            adapterToUse.replySecParams(device.instanceId, 0, securityParams, null, error => {
                if (error) {
                    reject(new Error(error.message));
                }

                resolve();
            });
        } else {
            reject(new Error('Unknown role'));
        }
    }).then(() => {
        dispatch(pairingStatusAction(id, device, BLEEventState.SUCCESS));
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

            resolve();
        });
    }).then(() => {
        dispatch(pairingStatusAction(id, device, BLEEventState.SUCCESS));
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
    }).then(device => {
        dispatch(deviceDisconnectedAction(device));
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

function connectionParamUpdateStatusAction(id, device, status) {
    return {
        type: DEVICE_CONNECTION_PARAM_UPDATE_STATUS,
        id: id,
        device: device,
        status: status,
    };
}

function pairingStatusAction(id, device, status) {
    return {
        type: DEVICE_PAIRING_STATUS,
        id: id,
        device: device,
        status: status,
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

function deviceDisconnectedAction(device) {
    return {
        type: DEVICE_DISCONNECTED,
        device,
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

function securityRequestAction(device) {
    return {
        type: DEVICE_SECURITY_REQUEST,
        device,
    };
}

function pairWithDeviceAction(device) {
    return {
        type: DEVICE_INITIATE_PAIRING,
        device,
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

export function findAdapters() {
    return dispatch => {
        return _getAdapters(dispatch);
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
