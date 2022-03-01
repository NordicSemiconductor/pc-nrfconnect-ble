/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

/* eslint no-use-before-define: off */

import { logger } from 'pc-nrfconnect-shared';

import { getInstanceIds } from '../utils/api';
import { DEVICE_NAME_UUID, GENERIC_ACCESS_UUID } from '../utils/definitions';
import openFileInDefaultApplication from '../utils/fileUtil';
import { getUuidDefinitionsFilePath } from '../utils/uuid_definitions';
import { showErrorDialog } from './errorDialogActions';

export const SELECT_COMPONENT = 'DEVICE_DETAILS_SELECT_COMPONENT';

export const DISCOVERING_ATTRIBUTES = 'DEVICE_DETAILS_DISCOVERING_ATTRIBUTES';
export const DISCOVERED_ATTRIBUTES = 'DEVICE_DETAILS_DISCOVERED_ATTRIBUTES';
export const DISCOVERED_DEVICE_NAME = 'DEVICE_DETAILS_DISCOVERED_DEVICE_NAME';

export const SET_ATTRIBUTE_EXPANDED = 'DEVICE_DETAILS_SET_ATTRIBUTE_EXPANDED';

export const WRITE_CHARACTERISTIC = 'DEVICE_DETAILS_WRITE_CHARACTERISTIC';
export const READ_CHARACTERISTIC = 'DEVICE_DETAILS_READ_CHARACTERISTIC';
export const WRITE_DESCRIPTOR = 'DEVICE_DETAILS_WRITE_DESCRIPTOR';
export const READ_DESCRIPTOR = 'DEVICE_DETAILS_READ_DESCRIPTOR';

export const COMPLETED_WRITING_ATTRIBUTE =
    'DEVICE_DETAILS_COMPLETED_WRITING_ATTRIBUTE';
export const COMPLETED_READING_ATTRIBUTE =
    'DEVICE_DETAILS_COMPLETED_READING_ATTRIBUTE';

export const ERROR_OCCURED = 'DEVICE_DETAILS_ERROR_OCCURED';

function discoverNameOfDevice(dispatch, getState, device, services) {
    return new Promise((resolve, reject) => {
        const gapService = services.find(
            service => service.uuid === GENERIC_ACCESS_UUID
        );
        if (gapService) {
            resolve(gapService);
            return;
        }
        reject(new Error('Could not find GAP service'));
    })
        .then(gapService =>
            dispatch(discoverCharacteristicsAndDescriptors(gapService))
        )
        .then(characteristics => {
            const deviceNameCharacteristic = characteristics.find(
                characteristic => characteristic.uuid === DEVICE_NAME_UUID
            );
            if (deviceNameCharacteristic) {
                return dispatch(readCharacteristic(deviceNameCharacteristic));
            }
            return undefined;
        })
        .then(value => dispatch(discoveredDeviceNameAction(device, value)))
        .catch(error => dispatch(showErrorDialog(error)));
}

function selectComponentAction(component) {
    return {
        type: SELECT_COMPONENT,
        component,
    };
}

function discoveringAttributesAction(parent) {
    return {
        type: DISCOVERING_ATTRIBUTES,
        parent,
    };
}

function discoveredAttributesAction(parent, attributes) {
    return {
        type: DISCOVERED_ATTRIBUTES,
        parent,
        attributes,
    };
}

function discoveredDeviceNameAction(device, value) {
    return {
        type: DISCOVERED_DEVICE_NAME,
        device,
        value,
    };
}

function setAttributeExpandedAction(attribute, value) {
    return {
        type: SET_ATTRIBUTE_EXPANDED,
        attribute,
        value,
    };
}

function completedReadingAttributeAction(attribute, value, error) {
    return {
        type: COMPLETED_READING_ATTRIBUTE,
        attribute,
        value,
        error,
    };
}

function completedWritingAttributeAction(attribute, value, error) {
    return {
        type: COMPLETED_WRITING_ATTRIBUTE,
        attribute,
        value,
        error,
    };
}

export function selectComponent(component) {
    return selectComponentAction(component);
}

export function discoverServices(device) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                dispatch(showErrorDialog(new Error('No adapter selected')));
                return;
            }

            dispatch(discoveringAttributesAction(device));

            adapterToUse.getServices(device.instanceId, (error, services) => {
                if (error) {
                    reject(new Error(error.message));
                    return;
                }

                resolve(services);
            });
        })
            .then(services => {
                dispatch(discoveredAttributesAction(device, services));
                discoverNameOfDevice(dispatch, getState, device, services);
            })
            .catch(error => {
                dispatch(discoveredAttributesAction(device));
                if (/BLE_ERROR_INVALID_CONN_HANDLE/.test(error.message)) {
                    dispatch(
                        showErrorDialog(
                            'Connection was lost during service discovery'
                        )
                    );
                } else {
                    dispatch(showErrorDialog(error));
                }
            });
}

export function discoverCharacteristics(service) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            dispatch(discoveringAttributesAction(service));

            adapterToUse.getCharacteristics(
                service.instanceId,
                (error, characteristics) => {
                    if (error) {
                        dispatch(discoveredAttributesAction(service));
                        reject(new Error(error.message));
                        return;
                    }

                    resolve(characteristics);
                }
            );
        })
            .then(characteristics => {
                dispatch(discoveredAttributesAction(service, characteristics));
                return characteristics;
            })
            .catch(error => {
                dispatch(showErrorDialog(error));
            });
}

export function discoverDescriptors(characteristic) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            dispatch(discoveringAttributesAction(characteristic));

            adapterToUse.getDescriptors(
                characteristic.instanceId,
                (error, descriptors) => {
                    if (error) {
                        dispatch(discoveredAttributesAction(characteristic));
                        reject(new Error(error.message));
                        return;
                    }

                    resolve(descriptors);
                }
            );
        })
            .then(descriptors => {
                dispatch(
                    discoveredAttributesAction(characteristic, descriptors)
                );
            })
            .catch(error => {
                dispatch(showErrorDialog(error));
            });
}

export function discoverCharacteristicsAndDescriptors(service) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            dispatch(discoveringAttributesAction(service));

            adapterToUse.getCharacteristics(
                service.instanceId,
                (error, characteristics) => {
                    if (error) {
                        dispatch(discoveredAttributesAction(service));
                        reject(new Error(error.message));
                        return;
                    }

                    resolve(characteristics);
                }
            );
        })
            .then(characteristics => {
                dispatch(discoveredAttributesAction(service, characteristics));
                return characteristics;
            })
            .then(characteristics => {
                let promise = Promise.resolve();
                characteristics.forEach(characteristic => {
                    promise = promise.then(() =>
                        dispatch(discoverDescriptors(characteristic))
                    );
                });
                return promise.then(() => characteristics);
            })
            .catch(error => {
                dispatch(showErrorDialog(error));
            });
}

export function setAttributeExpanded(attribute, value) {
    return (dispatch, getState) => {
        const state = getState();
        const adapterToUse = state.app.adapter.bleDriver.adapter;

        if (adapterToUse === null) {
            dispatch(showErrorDialog(new Error('No adapter selected')));
            return;
        }

        const instanceIds = getInstanceIds(attribute.instanceId);
        const { deviceDetails } = state.app.adapter.selectedAdapter;
        const service = deviceDetails.devices
            .get(instanceIds.device)
            .children.get(instanceIds.service);

        if (instanceIds.characteristic) {
            const characteristic = service.children.get(
                instanceIds.characteristic
            );
            if (
                !characteristic.children &&
                !characteristic.expanded &&
                !characteristic.discoveringChildren
            ) {
                dispatch(discoverDescriptors(characteristic));
            }
        } else if (
            !service.children &&
            !service.expanded &&
            !service.discoveringChildren
        ) {
            dispatch(discoverCharacteristicsAndDescriptors(service));
        }

        dispatch(setAttributeExpandedAction(attribute, value));
        dispatch(selectComponentAction(attribute.instanceId));
    };
}

export function readCharacteristic(characteristic) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            adapterToUse.readCharacteristicValue(
                characteristic.instanceId,
                (error, value) => {
                    if (error) {
                        dispatch(
                            completedReadingAttributeAction(
                                characteristic,
                                null,
                                error
                            )
                        );
                        reject(new Error(error.message));
                        return;
                    }

                    resolve(value);
                }
            );
        })
            .then(value => {
                dispatch(
                    completedReadingAttributeAction(characteristic, value)
                );
                return value;
            })
            .catch(error => {
                dispatch(showErrorDialog(error));
            });
}

export function writeCharacteristic(characteristic, value) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            const ack = !characteristic.properties.writeWoResp;

            adapterToUse.writeCharacteristicValue(
                characteristic.instanceId,
                value,
                ack,
                error => {
                    if (error) {
                        dispatch(
                            completedWritingAttributeAction(
                                characteristic,
                                null,
                                error
                            )
                        );
                        reject(new Error(error.message));
                        return;
                    }
                    dispatch(
                        completedWritingAttributeAction(characteristic, value)
                    );
                    resolve();
                }
            );
        }).catch(error => {
            dispatch(showErrorDialog(error));
        });
}

export function readDescriptor(descriptor) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            adapterToUse.readDescriptorValue(
                descriptor.instanceId,
                (error, value) => {
                    if (error) {
                        dispatch(
                            completedReadingAttributeAction(
                                descriptor,
                                null,
                                error
                            )
                        );
                        reject(new Error(error.message));
                        return;
                    }

                    dispatch(
                        completedReadingAttributeAction(descriptor, value)
                    );
                    resolve(value);
                }
            );
        }).catch(error => {
            dispatch(showErrorDialog(error));
        });
}

export function writeDescriptor(descriptor, value) {
    return (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const adapterToUse = getState().app.adapter.bleDriver.adapter;

            if (adapterToUse === null) {
                reject(new Error('No adapter selected'));
                return;
            }

            adapterToUse.writeDescriptorValue(
                descriptor.instanceId,
                value,
                true, // request ack (write request)
                error => {
                    if (error) {
                        dispatch(
                            completedWritingAttributeAction(
                                descriptor,
                                null,
                                error
                            )
                        );
                        reject(new Error(error.message));
                        return;
                    }

                    dispatch(
                        completedWritingAttributeAction(descriptor, value)
                    );
                    resolve();
                }
            );
        }).catch(error => {
            dispatch(showErrorDialog(error));
        });
}

export function openCustomUuidFile() {
    return () => {
        const path = getUuidDefinitionsFilePath();
        openFileInDefaultApplication(path, err => {
            if (err) {
                logger.info(err);
            }
        });
    };
}
