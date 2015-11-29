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

export const DISCOVERING_ATTRIBUTES = 'DEVICE_DETAILS_DISCOVERING_ATTRIBUTES';
export const DISCOVERED_ATTRIBUTES = 'DEVICE_DETAILS_DISCOVERED_ATTRIBUTES';

export const TOGGLED_ATTRIBUTE_EXPANDED = 'DEVICE_DETAILS_TOGGLED_ATTRIBUTE_EXPANDED';

import { getInstanceIds } from '../utils/api';

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
                    dispatch(discoveredAttributes(service));
                    reject(makeError({adapter: adapterToUse, service: service, error: error}));
                }

                resolve(characteristics);
            }
        );
    }).then(characteristics => {
        dispatch(discoveredAttributes(service, characteristics));
    }).catch(error => {
        console.log(error);
        dispatch(errorOccuredAction(error.adapter, error.error));
    });
}

function _discoverDescriptors(dispatch, getState, characteristic) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(makeError({error: `No adapter selected`}));
            return;
        }

        dispatch(discoveringAttributes(characteristic));

        adapterToUse.getDescriptors(
            characteristic.instanceId,
            (error, descriptors) => {
                if (error) {
                    dispatch(discoveredAttributes(characteristic));
                    reject(makeError({adapter: adapterToUse, characteristic: characteristic, error: error}));
                }

                resolve(descriptors);
            }
        );
    }).then(descriptors => {
        dispatch(discoveredAttributes(characteristic, descriptors));
    }).catch(error => {
        console.log(error);
        dispatch(errorOccuredAction(error.adapter, error.error));
    });
}

function _toggleAttributeExpanded(dispatch, getState, attribute) {
    const state = getState();
    const adapterToUse = state.adapter.api.selectedAdapter;

    if (adapterToUse === null) {
        dispatch(errorOccuredAction(undefined, 'No adapter selected'));
        return;
    }

    const instaceIds = getInstanceIds(attribute);
    const deviceDetails = state.adapter.adapters[state.adapter.selectedAdapter].deviceDetails;
    const service = deviceDetails.devices.get(instaceIds.device).children.get(instaceIds.service);

    if (instaceIds.characteristic) {
        const characteristic = service.children.get(instaceIds.characteristic);
        if (characteristic.children === null && !characteristic.expanded && !characteristic.discoveringChildren) {
            dispatch(discoverDescriptors(characteristic));
        }
    } else {
        if (service.children === null && !service.expanded && !service.discoveringChildren) {
            dispatch(discoverCharacteristics(service));
        }
    }

    dispatch(toggledAttributeExpanded(attribute));
    dispatch(selectComponentAction(attribute));
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

function toggledAttributeExpanded(attribute) {
    return {
        type: TOGGLED_ATTRIBUTE_EXPANDED,
        attribute,
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

export function toggleAttributeExpanded(attribute) {
    return (dispatch, getState) => {
        return _toggleAttributeExpanded(dispatch, getState, attribute);
    };
}
