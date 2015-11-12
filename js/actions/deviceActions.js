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

// import { getSelectedAdapter } from './util/common';
import _ from 'underscore';

export const DEVICE_CONNECT = 'DEVICE_CONNECT';
export const DEVICE_CONNECTED = 'DEVICE_CONNECTED';
export const DEVICE_DISCONNECT = 'DEVICE_DISCONNECT';
export const DEVICE_DISCONNECTED = 'DEVICE_DISCONNECTED';
export const ERROR_OCCURED = 'ERROR_OCCURED';



// Internal functions

function _connectToDevice(dispatch, getState, device) {
/*
    return new Promise((resolve, reject) => {
        const options = {
            baudRate: 115200,
            parity: 'none',
            flowControl: 'none',
            eventInterval: 1,
            logLevel: 'trace',
        };

        // Check if we already have an adapter open
        if(getState().adapter.api.selectedAdapter !== null) {
            _closeAdapter(dispatch, getState().adapter.api.selectedAdapter);
        }

        let adapterToUse = _.find(getState().adapter.api.adapters, x => { return x.adapterState.port === adapter; });

        if(adapterToUse === null) {
            reject({adapter: null, error: `Not able to find ${adapter}.`});
        }
        // Listen to errors from this adapter since we are opening it now
        adapterToUse.on('error', error => {
            dispatch(adapterErrorAction(adapterToUse, error));
        });

        // Listen to adapter changes
        adapterToUse.on('adapterStateChanged', adapterState => {
            dispatch(adapterStateChangedAction(adapterToUse, adapterState));
        });

        dispatch(adapterOpenAction(adapterToUse));

        adapterToUse.open(options, error => {
            if(error) {
                reject({adapter: adapterToUse, error: error});
            } else {
                resolve(adapterToUse);
            }
        });
    }).then(adapter => {
        dispatch(adapterOpenedAction(adapter));
    }).catch(errorData => {
        dispatch(adapterErrorAction(errorData.adapter, errorData.error));
    }); */
}

function _disconnectFromDevice(dispatch, getState, device) {
/*
    return new Promise((resolve, reject) => {
        adapter.close(error => {
            if(error) {
                reject({ adapter: adapter, error: error});
            } else {
                resolve(adapter);
            }
        });
    }).then(adapter => {
        dispatch(adapterClosedAction(adapter));
    }).catch(errorData => {
        dispatch(adapterErrorAction(errorData.adapter, errorData.error));
    }); */
}

function _cancelConnect(dispatch, getState) {
}

function deviceConnectAction(device) {
    return {
        type: DEVICE_CONNECT,
        device
    };
}

function deviceConnectedAction(device) {
    return {
        type: DEVICE_CONNECTED,
        device
    };
}

function deviceDisconnectedAction(device) {
    return {
        type: DEVICE_DISCONNECTED,
        device
    };
}

function deviceDisconnectAction(device) {
    return {
        type: DEVICE_DISCONNECT,
        device
    };
}

function errorOccuredAction(error) {
    return {
        type: ERROR_OCCURED,
        error
    };
}

export function connectToDevice(device) {
    return (dispatch, getState) => {
        return _connectToDevice(dispatch, getState);
    };
}

export function disconnectFromDevice(device) {
    return (dispatch, getState) => {
        return _disconnectFromDevice(dispatch, getState, device);
    };
}

export function cancelConnect() {
    return (dispatcj, getState) => {
        return _cancelConnect(dispatch, getState);
    };
}
