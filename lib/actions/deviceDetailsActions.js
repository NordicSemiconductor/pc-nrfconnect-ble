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

import { getInstanceIds } from '../utils/api';
import openFileInDefaultApplication from '../utils/fileUtil';
import showErrorDialog from './errorDialogActions';
import { getUuidByName, getUuidDefinitionsFilePath } from '../utils/uuid_definitions';
import { coreApi } from './coreActionsHack';

export const SELECT_COMPONENT = 'DEVICE_DETAILS_SELECT_COMPONENT';

export const DISCOVERING_ATTRIBUTES = 'DEVICE_DETAILS_DISCOVERING_ATTRIBUTES';
export const DISCOVERED_ATTRIBUTES = 'DEVICE_DETAILS_DISCOVERED_ATTRIBUTES';
export const DISCOVERED_DEVICE_NAME = 'DEVICE_DETAILS_DISCOVERED_DEVICE_NAME';

export const SET_ATTRIBUTE_EXPANDED = 'DEVICE_DETAILS_SET_ATTRIBUTE_EXPANDED';

export const WRITE_CHARACTERISTIC = 'DEVICE_DETAILS_WRITE_CHARACTERISTIC';
export const READ_CHARACTERISTIC = 'DEVICE_DETAILS_READ_CHARACTERISTIC';
export const WRITE_DESCRIPTOR = 'DEVICE_DETAILS_WRITE_DESCRIPTOR';
export const READ_DESCRIPTOR = 'DEVICE_DETAILS_READ_DESCRIPTOR';

export const COMPLETED_WRITING_ATTRIBUTE = 'DEVICE_DETAILS_COMPLETED_WRITING_ATTRIBUTE';
export const COMPLETED_READING_ATTRIBUTE = 'DEVICE_DETAILS_COMPLETED_READING_ATTRIBUTE';

export const ERROR_OCCURED = 'DEVICE_DETAILS_ERROR_OCCURED';

function LdiscoverServices(dispatch, getState, device) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            dispatch(showErrorDialog(new Error('No adapter selected')));
            return;
        }

        dispatch(discoveringAttributesAction(device));

        adapterToUse.getServices(
            device.instanceId,
            (error, services) => {
                if (error) {
                    reject(new Error(error.message));
                }

                resolve(services);
            },
        );
    }).then(services => {
        dispatch(discoveredAttributesAction(device, services));
        LdiscoverDeviceName(dispatch, getState, device, services);
    }).catch(error => {
        dispatch(discoveredAttributesAction(device));
        dispatch(showErrorDialog(error));
    });
}

function LdiscoverDeviceName(dispatch, getState, device, services) {
    return new Promise((resolve, reject) => {
        const genericAccessUuid = getUuidByName('Generic Access');
        services.valueSeq().forEach(service => {
            if (service.uuid === genericAccessUuid) {
                resolve(service);
            }
        });

        reject(new Error('Could not find GAP service'));
    }).then(gapService => LdiscoverCharacteristicsAndDescriptors(dispatch, getState, gapService))
    .then(characteristics => {
        const deviceNameUuid = getUuidByName('Device Name');
        const deviceNameCharacteristic =
            characteristics.find(characteristic => (characteristic.uuid === deviceNameUuid));
        if (deviceNameCharacteristic) {
            return LreadCharacteristic(dispatch, getState, deviceNameCharacteristic);
        }
        return undefined;
    }).then(value => {
        dispatch(discoveredDeviceNameAction(device, value));
    })
    .catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LdiscoverCharacteristics(dispatch, getState, service) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        dispatch(discoveringAttributesAction(service));

        adapterToUse.getCharacteristics(
            service.instanceId,
            (error, characteristics) => {
                if (error) {
                    dispatch(discoveredAttributesAction(service));
                    reject(new Error(error.message));
                }

                resolve(characteristics);
            },
        );
    }).then(characteristics => {
        dispatch(discoveredAttributesAction(service, characteristics));
        return characteristics;
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LdiscoverDescriptors(dispatch, getState, characteristic) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        dispatch(discoveringAttributesAction(characteristic));

        adapterToUse.getDescriptors(
            characteristic.instanceId,
            (error, descriptors) => {
                if (error) {
                    dispatch(discoveredAttributesAction(characteristic));
                    reject(new Error(error.message));
                }

                resolve(descriptors);
            },
        );
    }).then(descriptors => {
        dispatch(discoveredAttributesAction(characteristic, descriptors));
        return new Promise(resolve => resolve(characteristic));
    }).catch(error => {
        console.log(error);
        dispatch(showErrorDialog(error));
    });
}

function LdiscoverCharacteristicsAndDescriptors(dispatch, getState, service) {
    let retvalCharacteristics;
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        dispatch(discoveringAttributesAction(service));

        adapterToUse.getCharacteristics(
            service.instanceId,
            (error, characteristics) => {
                if (error) {
                    dispatch(discoveredAttributesAction(service));
                    reject(new Error(error.message));
                }

                resolve(characteristics);
            },
        );
    }).then(characteristics => {
        dispatch(discoveredAttributesAction(service, characteristics));
        retvalCharacteristics = characteristics;
        return new Promise(resolve => {
            resolve(characteristics);
        });
    }).then(characteristics => {
        let promise = Promise.resolve();
        characteristics.valueSeq().forEach(characteristic => {
            promise = promise.then(() =>
                LdiscoverDescriptors(dispatch, getState, characteristic));
        });
        return promise.then();
    }).then(() => retvalCharacteristics)
    .catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LsetAttributeExpanded(dispatch, getState, attribute, value) {
    const state = getState();
    const adapterToUse = state.app.adapter.api.selectedAdapter;

    if (adapterToUse === null) {
        dispatch(showErrorDialog(new Error('No adapter selected')));
        return;
    }

    const instanceIds = getInstanceIds(attribute.instanceId);
    const deviceDetails = state.app.adapter.getIn(['adapters', state.app.adapter.selectedAdapterIndex, 'deviceDetails']);
    const service = deviceDetails.devices.get(instanceIds.device).children.get(instanceIds.service);

    if (instanceIds.characteristic) {
        const characteristic = service.children.get(instanceIds.characteristic);
        if (!characteristic.children &&
            !characteristic.expanded &&
            !characteristic.discoveringChildren) {
            dispatch(discoverDescriptors(characteristic));
        }
    } else if (!service.children && !service.expanded && !service.discoveringChildren) {
        dispatch(discoverCharacteristicsAndDescriptors(service));
    }

    dispatch(setAttributeExpandedAction(attribute, value));
    dispatch(selectComponentAction(attribute.instanceId));
}

function LreadCharacteristic(dispatch, getState, characteristic) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        adapterToUse.readCharacteristicValue(
            characteristic.instanceId,
            (error, value) => {
                if (error) {
                    dispatch(completedReadingAttributeAction(characteristic, null, error));
                    reject(new Error(error.message));
                }

                resolve(value);
            },
        );
    }).then(value => {
        dispatch(completedReadingAttributeAction(characteristic, value));
        return value;
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LwriteCharacteristic(dispatch, getState, characteristic, value) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        let ack;
        if (characteristic.properties.write === true) {
            ack = true;
        } else if (characteristic.properties.writeWoResp === true) {
            ack = false;
        } else {
            ack = true;
        }

        adapterToUse.writeCharacteristicValue(characteristic.instanceId, value, ack, error => {
            if (error) {
                dispatch(completedWritingAttributeAction(characteristic, null, error));
                reject(new Error(error.message));
            } else {
                resolve();
            }
        });
    }).then(() => {
        dispatch(completedWritingAttributeAction(characteristic, value));
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LreadDescriptor(dispatch, getState, descriptor) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        adapterToUse.readDescriptorValue(
            descriptor.instanceId,
            (error, value) => {
                if (error) {
                    dispatch(completedReadingAttributeAction(descriptor, null, error));
                    reject(new Error(error.message));
                }

                resolve(value);
            },
        );
    }).then(value => {
        dispatch(completedReadingAttributeAction(descriptor, value));
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LwriteDescriptor(dispatch, getState, descriptor, value) {
    return new Promise((resolve, reject) => {
        const adapterToUse = getState().app.adapter.api.selectedAdapter;

        if (adapterToUse === null) {
            reject(new Error('No adapter selected'));
        }

        adapterToUse.writeDescriptorValue(
            descriptor.instanceId,
            value,
            true, // request ack (write request)
            error => {
                if (error) {
                    dispatch(completedWritingAttributeAction(descriptor, null, error));
                    reject(new Error(error.message));
                }

                resolve();
            },
        );
    }).then(() => {
        dispatch(completedWritingAttributeAction(descriptor, value));
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

function LopenCustomUuidFile() {
    const path = getUuidDefinitionsFilePath();
    openFileInDefaultApplication(path, err => {
        if (err) {
            coreApi.logger.info(err);
        }
    });
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
    return (dispatch, getState) => LdiscoverServices(dispatch, getState, device);
}

export function discoverDeviceName(device) {
    return (dispatch, getState) => LdiscoverDeviceName(dispatch, getState, device);
}

export function discoverCharacteristics(service) {
    return (dispatch, getState) => LdiscoverCharacteristics(dispatch, getState, service);
}

export function discoverDescriptors(characteristic) {
    return (dispatch, getState) => LdiscoverDescriptors(dispatch, getState, characteristic);
}

export function discoverCharacteristicsAndDescriptors(service) {
    return (dispatch, getState) =>
        LdiscoverCharacteristicsAndDescriptors(dispatch, getState, service);
}

export function setAttributeExpanded(attribute, value) {
    return (dispatch, getState) => LsetAttributeExpanded(dispatch, getState, attribute, value);
}

export function readCharacteristic(characteristic) {
    return (dispatch, getState) => LreadCharacteristic(dispatch, getState, characteristic);
}

export function writeCharacteristic(characteristic, value) {
    return (dispatch, getState) => LwriteCharacteristic(dispatch, getState, characteristic, value);
}

export function readDescriptor(descriptor) {
    return (dispatch, getState) => LreadDescriptor(dispatch, getState, descriptor);
}

export function writeDescriptor(descriptor, value) {
    return (dispatch, getState) => LwriteDescriptor(dispatch, getState, descriptor, value);
}

export function openCustomUuidFile() {
    return (dispatch, getState) => LopenCustomUuidFile(dispatch, getState);
}
