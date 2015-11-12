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
            dispatch(adapterAddedAction(adapter));
        });
        _adapterFactory.on('removed', adapter => {
            dispatch(adapterRemovedAction(adapter));
        });
        _adapterFactory.on('error', (error) => {
            dispatch(errorOccuredAction(error));
        });

        // Add the adapters to the store
        _.map(adapters, (adapter) => {
            dispatch(adapterAddedAction(adapter));
        });
    }).catch(error => {
        dispatch(errorOccuredAction(error));
    });
}

function _openAdapter(dispatch, getState, adapter) {
    return new Promise((resolve, reject) => {
        const options = {
            baudRate: 115200,
            parity: 'none',
            flowControl: 'none',
            eventInterval: 100,
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
        dispatch(adapterClosedAction(adapter));
    }).catch(errorData => {
        dispatch(adapterErrorAction(errorData.adapter, errorData.error));
    });
}

function adapterOpenedAction(adapter)
{
    return {
        type: ADAPTER_OPENED,
        adapter
    };
}

function adapterOpenAction(adapter)
{
    return {
        type: ADAPTER_OPEN,
        adapter
    };
}

function adapterClosedAction(adapter) {
    return {
        type: ADAPTER_CLOSED,
        adapter
    };
}

function adapterRemovedAction(adapter) {
    return {
        type: ADAPTER_REMOVED,
        adapter
    };
}

function adapterAddedAction(adapter) {
    return {
        type: ADAPTER_ADDED,
        adapter
    };
}

function adapterErrorAction(adapter, error) {
    return {
        type: ADAPTER_ERROR,
        adapter,
        error
    };
}

function adapterStateChangedAction(adapter, adapterState) {
    return {
        type: ADAPTER_STATE_CHANGED,
        adapter,
        adapterState
    };
}

function errorOccuredAction(error) {
    return {
        type: ERROR_OCCURED,
        error
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
