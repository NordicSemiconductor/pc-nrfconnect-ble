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
export const ERROR_OCCURED = 'ERROR_OCCURED';

import _ from 'underscore';

import { driver, api } from 'pc-ble-driver-js';
const _adapterFactory = api.AdapterFactory.getInstance(driver);

// Internal functions
function _getAdapters(dispatch) {
    return new Promise((resolve, reject) => {
        _adapterFactory.getAdapters((error, adapters) => {
            if(error) {
                reject(error);
            } else {
                resolve(adapters);
            }
        });
    }).then(adapters => {
        // Register listeners for adapters added/removed
        _adapterFactory.on('added', adapter => {
            dispatch(adapterAdded(adapter));
        });
        _adapterFactory.on('removed', adapter => {
            dispatch(adapterRemoved(adapter));
        });
        _adapterFactory.on('error', (error) => {
            dispatch(errorOccured(error));
        });

        // Add the adapters to the store
        _.map(adapters, (adapter) => {
            dispatch(adapterAdded(adapter));
        });
    }).catch(error => {
        dispatch(errorOccured(error));
    });
}

function _openAdapter(dispatch, getState, adapter) {
    return new Promise((resolve, reject) => {
        const options = {
            baudRate: 115200,
            parity: 'none',
            flowControl: 'none',
            eventInterval: 1,
            logLevel: 'trace',
        };

        // Check if we already have an adapter open
        if(getState().adapter.selectedAdapter !== null) {
            _closeAdapter(dispatch, getState().adapter.selectedAdapter);
        }

        let adapterToUse = _.find(getState().adapter.adapters, x => { return x.instanceId === adapter; });
        // Listen to errors from this adapter since we are opening it now
        adapterToUse.on('error', error => { dispatch(adapterError(adapterToUse, error)); });

        dispatch(adapterOpen(adapterToUse));

        adapterToUse.open(options, error => {
            if(error) {
                reject({adapter: adapterToUse, error: error});
            } else {
                resolve(adapterToUse);
            }
        });
    }).then(adapter => {
        dispatch(adapterOpened(adapter));
    }).catch(errorData => {
        dispatch(adapterError(errorData.adapter, errorData.error));
    });
}

function _closeAdapter(dispatch, adapter) {
    return new Promise((resolve, reject) => {
        adapter.close(error => {
            if(error) {
                reject({ adapter: adapter, error: error});
            } else {
                resolve(adapter);
            }
        });
    }).then(adapter => {
        dispatch(adapterClosed(adapter));
    }).catch(errorData => {
        dispatch(adapterError(errorData.adapter, errorData.error));
    });
}

function adapterOpened(adapter)
{
    return {
        type: ADAPTER_OPENED,
        adapter
    };
}

function adapterOpen(adapter)
{
    return {
        type: ADAPTER_OPEN,
        adapter
    };
}

function adapterClosed(adapter) {
    return {
        type: ADAPTER_CLOSED,
        adapter
    };
}

function adapterRemoved(adapter) {
    return {
        type: ADAPTER_REMOVED,
        adapter
    };
}

function adapterAdded(adapter) {
    return {
        type: ADAPTER_ADDED,
        adapter
    };
}

function adapterError(adapter, error) {
    return {
        type: ADAPTER_ERROR,
        adapter,
        error
    };
}

function errorOccured(error) {
    return {
        type: ERROR_OCCURED,
        error
    };
}

export function findAdapters() {
    return dispatch => {
        // Return a promise to wait for.
        // During processing of this promise actions has been dispatched.
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
