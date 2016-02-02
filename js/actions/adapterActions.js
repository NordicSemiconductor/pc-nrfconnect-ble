/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

export const ERROR_OCCURED = 'ERROR_OCCURED';

export const ATTRIBUTE_VALUE_CHANGED = 'ADAPTER_ATTRIBUTE_VALUE_CHANGED';

export const TRACE = 0;
export const DEBUG = 1;
export const INFO = 2;
export const WARNING = 3;
export const ERROR = 4;
export const FATAL = 5;

import _ from 'underscore';

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
        };

        // Check if we already have an adapter open
        if (getState().adapter.api.selectedAdapter !== null) {
            _closeAdapter(dispatch, getState().adapter.api.selectedAdapter);
        }

        // TODO: try to remove the underscore library
        const adapterToUse = _.find(getState().adapter.api.adapters, x => { return x.state.port === adapter; });

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

        // TODO: remove listeners when closing adapter so that we do not leak memory

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

        adapterToUse.on('characteristicValueChanged', characteristic => {
            dispatch(attributeValueChangedAction(characteristic, characteristic.value));
        });

        adapterToUse.on('descriptorValueChanged', descriptor => {
            dispatch(attributeValueChangedAction(descriptor, descriptor.value));
        });

        adapterToUse.on('securityChanged', (device, authParams) => {
            dispatch(securityChangedAction(device, authParams));
        });

        adapterToUse.on('logMessage', _onLogMessage);
        adapterToUse.on('status', _onStatus);

        dispatch(adapterOpenAction(adapterToUse));

        adapterToUse.open(options, error => {
            if (error) {
                reject(); // Let the error event inform the user about the error.
            } else {
                adapterToUse.getState((error, state) => {
                    if (error) {
                        reject(new Error(error.message));
                    } else {
                        resolve(adapterToUse);
                    }
                });
            }
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

function _onStatus(code, message) {
    logger.warn(`Received status with code ${code}, message ${message}`);
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
        // Do we need to tell anyone this went OK ?
    }).catch(error => {
        dispatch(connectionParamUpdateStatusAction(id, device, BLEEventState.ERROR));
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

function _pairWithDevice(dispatch, getState, device) {
    function onError(reject, error) {
        reject(new Error(error.message));
    }

    const adapterToUse = getState().adapter.api.selectedAdapter;

    return new Promise((resolve, reject) => {

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        adapterToUse.once('error', error => onError(reject, error));

        adapterToUse.pair(device.instanceId, false, error => {
            if (error) {
                reject(new Error(error.message));
            }

            resolve();
        });
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function _connectToDevice(dispatch, getState, device) {
    function onCompleted(resolve, adapter) {
        resolve(adapter);
    }

    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

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
        adapterToUse.once('deviceConnected', onCompleted.bind(this, resolve, adapterToUse));
        adapterToUse.once('connectTimedOut', onCompleted.bind(this, resolve, adapterToUse));

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
        adapterToUse.removeListener(onCompleted);
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
        // OK, nothing to do... ?
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

        adapterToUse.cancelConnect(
            error => {
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

export function pairWithDevice(device) {
    return (dispatch, getState) => {
        return _pairWithDevice(dispatch, getState, device);
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
