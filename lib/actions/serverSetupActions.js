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

import { readFileSync, writeFile } from 'fs';
import { logger } from 'nrfconnect/core';
import bleDriver from 'pc-ble-driver-js';

import { ValidationError } from '../common/Errors';
import { getInstanceIds } from '../utils/api';
import * as AdapterActions from './adapterActions';
import { showErrorDialog } from './errorDialogActions';

export const SELECT_COMPONENT = 'SERVER_SETUP_SELECT_COMPONENT';
export const SET_ATTRIBUTE_EXPANDED = 'SERVER_SETUP_SET_ATTRIBUTE_EXPANDED';

export const ADD_NEW_SERVICE = 'SERVER_SETUP_ADDED_NEW_SERVICE';
export const ADD_NEW_CHARACTERISTIC = 'SERVER_SETUP_ADDED_NEW_CHARACTERISTIC';
export const ADD_NEW_DESCRIPTOR = 'SERVER_SETUP_ADDED_NEW_DESCRIPTOR';
export const CHANGED_ATTRIBUTE = 'SERVER_SETUP_CHANGED_ATTRIBUTE';
export const REMOVE_ATTRIBUTE = 'SERVER_SETUP_REMOVE_ATTRIBUTE';

export const CLEAR_SERVER = 'SERVER_SETUP_CLEAR_SERVER';
export const APPLIED_SERVER = 'SERVER_SETUP_APPLIED_SERVER';

export const SHOW_APPLY_DIALOG = 'SERVER_SETUP_SHOW_APPLY_DIALOG';
export const HIDE_APPLY_DIALOG = 'SERVER_SETUP_HIDE_APPLY_DIALOG';

export const SHOW_DELETE_DIALOG = 'SERVER_SETUP_SHOW_DELETE_DIALOG';
export const HIDE_DELETE_DIALOG = 'SERVER_SETUP_HIDE_DELETE_DIALOG';

export const SHOW_CLEAR_DIALOG = 'SERVER_SETUP_SHOW_CLEAR_DIALOG';
export const HIDE_CLEAR_DIALOG = 'SERVER_SETUP_HIDE_CLEAR_DIALOG';

export const LOAD = 'SERVER_SETUP_LOAD';

const SCCD_UUID = '2903';
const CCCD_UUID = '2902';

function setAttributeExpandedAction(attribute, value) {
    return {
        type: SET_ATTRIBUTE_EXPANDED,
        attribute,
        value,
    };
}

function selectComponentAction(component) {
    return {
        type: SELECT_COMPONENT,
        component,
    };
}

function addNewServiceAction() {
    return {
        type: ADD_NEW_SERVICE,
    };
}

function addNewCharacteristicAction(parent) {
    return {
        type: ADD_NEW_CHARACTERISTIC,
        parent,
    };
}

function addNewDescriptorAction(parent) {
    return {
        type: ADD_NEW_DESCRIPTOR,
        parent,
    };
}

function saveChangedAttributeAction(attribute) {
    return {
        type: CHANGED_ATTRIBUTE,
        attribute,
    };
}

function removeAttributeAction() {
    return {
        type: REMOVE_ATTRIBUTE,
    };
}

function clearServerAction() {
    return {
        type: CLEAR_SERVER,
    };
}

function appliedServerAction(services) {
    return {
        type: APPLIED_SERVER,
        services,
    };
}

function showApplyDialogAction() {
    return {
        type: SHOW_APPLY_DIALOG,
    };
}

function hideApplyDialogAction() {
    return {
        type: HIDE_APPLY_DIALOG,
    };
}

function showDeleteDialogAction() {
    return {
        type: SHOW_DELETE_DIALOG,
    };
}

function hideDeleteDialogAction() {
    return {
        type: HIDE_DELETE_DIALOG,
    };
}

function showClearDialogAction() {
    return {
        type: SHOW_CLEAR_DIALOG,
    };
}

function hideClearDialogAction() {
    return {
        type: HIDE_CLEAR_DIALOG,
    };
}

function loadAction(setup) {
    return {
        type: LOAD,
        setup,
    };
}

function parentIsGAPorGATT(parent) {
    const parentInstanceIds = getInstanceIds(parent.instanceId);

    return (
        parentInstanceIds.service === 'local.server.0' ||
        parentInstanceIds.service === 'local.server.1'
    );
}

export function selectComponent(component) {
    return selectComponentAction(component);
}

export function setAttributeExpanded(attribute, value) {
    return dispatch => {
        dispatch(setAttributeExpandedAction(attribute, value));
        dispatch(selectComponentAction(attribute.instanceId));
    };
}

export function addNewService() {
    return addNewServiceAction();
}

export function addNewCharacteristic(parent) {
    return dispatch => {
        if (parentIsGAPorGATT(parent)) {
            // Not allowed to add characteristics under the GAP and GATT services.
            return;
        }

        dispatch(addNewCharacteristicAction(parent));
    };
}

export function addNewDescriptor(parent) {
    return dispatch => {
        if (parentIsGAPorGATT(parent)) {
            // Not allowed to add descriptors under the GAP and GATT services.
            return;
        }

        dispatch(addNewDescriptorAction(parent));
    };
}

export function saveChangedAttribute(changedAttribute) {
    return dispatch => {
        const attribute = changedAttribute;
        if (attribute.value) {
            if (
                attribute.fixedLength &&
                attribute.value.length < attribute.maxLength
            ) {
                const fillerArray = Array(attribute.maxLength).fill(0);
                attribute.value = attribute.value.concat(fillerArray);
            }

            attribute.value = attribute.value.slice(0, attribute.maxLength);
        }

        dispatch(saveChangedAttributeAction(attribute));
    };
}

export function removeAttribute() {
    return (dispatch, getState) => {
        const state = getState();
        const { serverSetup } = state.app.adapter.selectedAdapter;
        const selectedInstanceIds = getInstanceIds(
            serverSetup.selectedComponent
        );

        if (
            selectedInstanceIds.service === 'local.server.0' ||
            selectedInstanceIds.service === 'local.server.1'
        ) {
            // Not allowed to remove GAP or GATT service and their children.
            dispatch(hideDeleteDialog());
            return;
        }

        dispatch(removeAttributeAction());
    };
}

export function clearServer() {
    return clearServerAction();
}

export function applyServer() {
    return (dispatch, getState) => {
        const state = getState();
        const invalidUuidErrorMessage =
            'Invalid UUID. All attributes must have a valid UUID.';
        const serviceFactory = new bleDriver.ServiceFactory();
        const { serverSetup } = state.app.adapter.selectedAdapter;
        const { adapter } = state.app.adapter.bleDriver;
        const services = [];

        const serverSetupChildren = serverSetup.children.toArray();
        for (let i = 0; i < serverSetupChildren.length; i += 1) {
            const service = serverSetupChildren[i];
            if (service) {
                // TODO: At some point we may need/want to support secondary services
                const { instanceId, uuid } = service;

                if (!uuid || uuid.length === 0) {
                    dispatch(
                        showErrorDialog(
                            new ValidationError(invalidUuidErrorMessage)
                        )
                    );
                    dispatch(selectComponent(instanceId));
                    return;
                }

                const factoryService = serviceFactory.createService(uuid);
                services.push(factoryService);

                const serviceChildren = service.children.toArray();
                for (let j = 0; j < serviceChildren.length; j += 1) {
                    const characteristic = serviceChildren[j];
                    if (characteristic) {
                        const {
                            value,
                            properties,
                            readPerm,
                            writePerm,
                            fixedLength,
                            maxLength,
                            uuid: characteristicUuid,
                            instanceId: characteristicInstanceId,
                        } = characteristic;

                        if (
                            !characteristicUuid ||
                            characteristicUuid.length === 0
                        ) {
                            dispatch(
                                showErrorDialog(
                                    new ValidationError(invalidUuidErrorMessage)
                                )
                            );
                            dispatch(
                                selectComponent(characteristic.instanceId)
                            );
                            return;
                        }

                        let needSccdDescriptor = properties.broadcast || false;
                        let needCccdDescriptor =
                            properties.notify || properties.indicate || false;

                        const characteristicOptions = {
                            readPerm: readPerm.split(' '),
                            writePerm: writePerm.split(' '),
                            variableLength: !fixedLength,
                            maxLength,
                        };

                        const factoryCharacteristic =
                            serviceFactory.createCharacteristic(
                                factoryService,
                                characteristicUuid,
                                value.toArray(),
                                properties.toObject(),
                                characteristicOptions
                            );

                        const characteristicChildren =
                            characteristic.children.toArray();
                        for (
                            let k = 0;
                            k < characteristicChildren.length;
                            k += 1
                        ) {
                            const descriptor = characteristicChildren[k];
                            if (descriptor) {
                                const {
                                    uuid: descriptorUuid,
                                    instanceId: descriptorInstanceId,
                                    readPerm: descriptorReadPerm,
                                    writePerm: descriptorWritePerm,
                                    fixedLength: descriptorFixedLength,
                                    maxLength: descriptorMaxLength,
                                    value: descriptorValue,
                                } = descriptor;
                                if (
                                    !descriptorUuid ||
                                    descriptorUuid.length === 0
                                ) {
                                    dispatch(
                                        showErrorDialog(
                                            new ValidationError(
                                                invalidUuidErrorMessage
                                            )
                                        )
                                    );
                                    dispatch(
                                        selectComponent(descriptorInstanceId)
                                    );
                                    return;
                                }

                                if (descriptorUuid === SCCD_UUID) {
                                    needSccdDescriptor = false;
                                } else if (descriptorUuid === CCCD_UUID) {
                                    needCccdDescriptor = false;
                                }

                                const descriptorOptions = {
                                    readPerm: descriptorReadPerm.split(' '),
                                    writePerm: descriptorWritePerm.split(' '),
                                    variableLength: !descriptorFixedLength,
                                    maxLength: descriptorMaxLength,
                                };

                                serviceFactory.createDescriptor(
                                    factoryCharacteristic,
                                    descriptorUuid,
                                    descriptorValue.toArray(),
                                    descriptorOptions
                                );
                            }
                        }
                        if (needSccdDescriptor) {
                            dispatch(
                                showErrorDialog(
                                    new ValidationError(
                                        'Missing SCCD descriptor (uuid: 2903). All characteristics with broadcast property must have an SCCD descriptor.'
                                    )
                                )
                            );
                        }

                        if (needCccdDescriptor) {
                            dispatch(
                                showErrorDialog(
                                    new ValidationError(
                                        'Missing CCCD descriptor (uuid: 2902). All characteristics with notify or indicate properties must have a CCCD descriptor.'
                                    )
                                )
                            );
                        }

                        if (needSccdDescriptor || needCccdDescriptor) {
                            dispatch(selectComponent(characteristicInstanceId));
                            return;
                        }
                    }
                }
            }
        }

        adapter.setServices(services, err => {
            if (err) {
                logger.info('Failed to set services');
                logger.info(err);
                return;
            }
            dispatch(appliedServerAction(services));
        });
    };
}

export function resetAndApplyServer() {
    return (dispatch, getState) => {
        const bleDriverAdapter = getState().app.adapter.bleDriver.adapter;
        const serverSetup =
            getState().app.adapter.selectedAdapter.serverSetup.toJS();

        // Keeping the current adapter properties. We need this for opening the
        // adapter again after it has been closed.
        const { port, baudRate } = bleDriverAdapter.state;
        const sdBleApiVersion = bleDriverAdapter.driver.NRF_SD_BLE_API_VERSION;

        dispatch(AdapterActions.closeAdapter()).then(() => {
            dispatch(
                AdapterActions.openAdapter(port, baudRate, sdBleApiVersion)
            )
                .then(
                    openedAdapter =>
                        new Promise(resolve => {
                            // Waiting for the BLE stack to be enabled before applying
                            // the server setup.
                            const stateChangedHandler = state => {
                                if (state.bleEnabled === true) {
                                    dispatch(loadAction(serverSetup));
                                    dispatch(applyServer());
                                    openedAdapter.removeListener(
                                        'stateChanged',
                                        stateChangedHandler
                                    );
                                    resolve();
                                }
                            };
                            openedAdapter.on(
                                'stateChanged',
                                stateChangedHandler
                            );
                        })
                )
                .catch(error => {
                    logger.error(
                        `Unable to reset and apply server setup: ${error.message}`
                    );
                });
        });
    };
}

export function showApplyDialog() {
    return showApplyDialogAction();
}

export function hideApplyDialog() {
    return hideApplyDialogAction();
}

export function showDeleteDialog() {
    return showDeleteDialogAction();
}

export function hideDeleteDialog() {
    return hideDeleteDialogAction();
}

export function showClearDialog() {
    return showClearDialogAction();
}

export function hideClearDialog() {
    return hideClearDialogAction();
}

export function saveServerSetup(filename) {
    return (dispatch, getState) => {
        if (filename) {
            const adapter = getState().app.adapter.selectedAdapter;
            writeFile(filename, JSON.stringify(adapter.serverSetup), error => {
                if (error) {
                    dispatch(showErrorDialog(error));
                    return;
                }

                logger.info(`Server setup saved to ${filename}.`);
            });
        }
    };
}

export function loadServerSetup(filename) {
    return dispatch => {
        // Load file into immutable JS structure and replace it in the reducer.
        // The reducer replaces the instanceId's
        try {
            const setup = readFileSync(filename);
            const setupObj = JSON.parse(setup);

            if (!setupObj) {
                throw new Error('Illegal format on server setup file.');
            }

            // Replace underscored names for backward compatibility of setup files
            const setupObjString = JSON.stringify(setupObj)
                .replace(/"write_wo_resp"/g, '"writeWoResp"')
                .replace(/"auth_signed_wr"/g, '"authSignedWr"')
                .replace(/"reliable_wr"/g, '"reliableWr"')
                .replace(/"wr_aux"/g, '"wrAux"');

            const setupObjModified = JSON.parse(setupObjString);

            dispatch(loadAction(setupObjModified));
            logger.info(`Server setup loaded from ${filename}.`);
        } catch (e) {
            dispatch(showErrorDialog(e));
        }
    };
}
