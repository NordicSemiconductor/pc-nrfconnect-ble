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

export const SELECT_COMPONENT = 'DEVICE_DETAILS_SELECT_COMPONENT';

export const DISCOVERING_ATTRIBUTES = 'DISCOVERING_ATTRIBUTES';
export const DISCOVERED_ATTRIBUTES = 'DISCOVERED_ATTRIBUTES';

function selectComponentAction(component) {
    return {
        type: SELECT_COMPONENT,
        component: component,
    };
}

// This function shall only be used by Promise.reject calls.
function makeError(data) {
    let {adapter, device, error} = data;

    return {
        adapter: adapter,
        device: device,
        error: error,
    };
}

function _discoverServices(dispatch, getState, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            dispatch(makeError({error: `No adapter selected`}));
            return;
        }

        dispatch(discoveringAttributes(device));

        adapterToUse.getServices(
            device.instanceId,
            (error, services) => {
                if (error) {
                    reject(makeError({adapter: adapterToUse, device: device, error: error}));
                }

                resolve(services);
            }
        );
    }).then(services => {
        dispatch(discoveredAttributes(device, services));
    }).catch(error => {
        dispatch(discoveredAttributes(device));
        dispatch(errorOccuredAction(error.adapter, error.error));
    });
}

function _discoverCharacteristics(dispatch, getState, service) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            dispatch(makeError({error: `No adapter selected`}));
            return;
        }

        dispatch(discoveringAttributes(service));

        adapterToUse.getCharacteristics(
            service.instanceId,
            (error, characteristics) => {
                if (error) {
                    reject(makeError({adapter: adapterToUse, service: service, error: error}));
                }

                resolve(characteristics);
            }
        );
    }).then(characteristics => {
        dispatch(discoveredAttributes(service, characteristics));
    }).catch(error => {
        dispatch(discoveredAttributes(service));
        dispatch(errorOccuredAction(error.adapter, error.error));
    });
}

function _discoverDescriptors(dispatch, getState, characteristic) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            dispatch(makeError({error: `No adapter selected`}));
            return;
        }

        dispatch(discoveringAttributes(characteristic));

        adapterToUse.getDescriptors(
            characteristic.instanceId,
            (error, descriptors) => {
                if (error) {
                    reject(makeError({adapter: adapterToUse, characteristic: characteristic, error: error}));
                }

                resolve(descriptors);
            }
        );
    }).then(descriptors => {
        dispatch(discoveredAttributes(characteristic, descriptors));
    }).catch(error => {
        dispatch(discoveredAttributes(characteristic));
        dispatch(errorOccuredAction(error.adapter, error.error));
    });
}

function discoveringAttributes(parent) {
    return {
        type: DISCOVERING_ATTRIBUTES,
        parent,
    };
}

function discoveredAttributes(parent, attributes) {
    return {
        type: DISCOVERED_ATTRIBUTES,
        parent,
        attributes,
    };
}

export function selectComponent(component) {
    return selectComponentAction(component);
}

export function discoverServices(device) {
    return (dispatch, getState) => {
        return _discoverServices(dispatch, getState, device);
    };
}

export function discoverCharacteristics(service) {
    return (dispatch, getState) => {
        return _discoverCharacteristics(dispatch, getState, service);
    };
}

export function discoverDescriptors(characteristic) {
    return (dispatch, getState) => {
        return _discoverDescriptors(dispatch, getState, characteristic);
    };
}
