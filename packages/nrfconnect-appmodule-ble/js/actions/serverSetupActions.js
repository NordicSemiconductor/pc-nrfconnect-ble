/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

export const SELECT_COMPONENT = 'SERVER_SETUP_SELECT_COMPONENT';
export const SET_ATTRIBUTE_EXPANDED = 'SERVER_SETUP_SET_ATTRIBUTE_EXPANDED';

export const ADD_NEW_SERVICE = 'SERVER_SETUP_ADDED_NEW_SERVICE';
export const ADD_NEW_CHARACTERISTIC = 'SERVER_SETUP_ADDED_NEW_CHARACTERISTIC';
export const ADD_NEW_DESCRIPTOR = 'SERVER_SETUP_ADDED_NEW_DESCRIPTOR';
export const CHANGED_ATTRIBUTE = 'SERVER_SETUP_CHANGED_ATTRIBUTE';
export const REMOVE_ATTRIBUTE = 'SERVER_SETUP_REMOVE_ATTRIBUTE';

export const CLEAR_SERVER = 'SERVER_SETUP_CLEAR_SERVER';
export const APPLIED_SERVER = 'SERVER_SETUP_APPLIED_SERVER';

export const SHOW_DELETE_DIALOG = 'SERVER_SETUP_SHOW_DELETE_DIALOG';
export const HIDE_DELETE_DIALOG = 'SERVER_SETUP_HIDE_DELETE_DIALOG';

export const SHOW_CLEAR_DIALOG = 'SERVER_SETUP_SHOW_CLEAR_DIALOG';
export const HIDE_CLEAR_DIALOG = 'SERVER_SETUP_HIDE_CLEAR_DIALOG';

export const SHOW_DISCARD_DIALOG = 'SERVER_SETUP_SHOW_DISCARD_DIALOG';
export const HIDE_DISCARD_DIALOG = 'SERVER_SETUP_DISCARD_DIALOG';

export const LOAD = 'SERVER_SETUP_LOAD';

import { getInstanceIds } from '../utils/api';
import { writeFile, readFileSync } from 'fs';

import { api } from 'pc-ble-driver-js';
import { logger } from '../logging';
import { showErrorDialog } from './errorDialogActions';

import { ValidationError } from '../common/Errors';

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
        component: component,
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

function appliedServerAction(server) {
    return {
        type: APPLIED_SERVER,
        server: server,
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

function showDiscardDialogAction() {
    return {
        type: SHOW_DISCARD_DIALOG,
    };
}

function hideDiscardDialogAction() {
    return {
        type: HIDE_DISCARD_DIALOG,
    };
}

function loadAction(setup) {
    return {
        type: LOAD,
        setup,
    };
}

function _setAttributeExpanded(dispatch, getState, attribute, value) {
    dispatch(setAttributeExpandedAction(attribute, value));
    dispatch(selectComponentAction(attribute.instanceId));
}

function _parentIsGAPorGATT(parent) {
    const parentInstanceIds = getInstanceIds(parent.instanceId);

    return (parentInstanceIds.service === 'local.server.0' || parentInstanceIds.service === 'local.server.1');
}

function _addNewCharacteristic(dispatch, getState, parent) {
    if (_parentIsGAPorGATT(parent)) {
        // Not allowed to add characteristics under the GAP and GATT services.
        return;
    }

    dispatch(addNewCharacteristicAction(parent));
}

function _addNewDescriptor(dispatch, getState, parent) {
    if (_parentIsGAPorGATT(parent)) {
        // Not allowed to add descriptors under the GAP and GATT services.
        return;
    }

    dispatch(addNewDescriptorAction(parent));
}

function _saveChangedAttribute(dispatch, getState, attribute) {
    if (attribute.value) {
        if (attribute.fixedLength && attribute.value.length < attribute.maxLength) {
            const fillerArray = Array(attribute.maxLength).fill(0);
            attribute.value = attribute.value.concat(fillerArray);
        }

        attribute.value = attribute.value.slice(0, attribute.maxLength);
    }

    dispatch(saveChangedAttributeAction(attribute));
}

function _removeAttribute(dispatch, getState) {
    const state = getState();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const selectedInstanceIds = getInstanceIds(serverSetup.selectedComponent);

    if (selectedInstanceIds.service === 'local.server.0' || selectedInstanceIds.service === 'local.server.1') {
        // Not allowed to remove GAP or GATT service and their children.
        dispatch(hideDeleteDialog());
        return;
    }

    dispatch(removeAttributeAction());
}

function _applyServer(dispatch, getState) {
    const state = getState();
    const invalidUuidErrorMessage = 'Invalid UUID. All attributes must have a valid UUID.';
    const serviceFactory = new api.ServiceFactory();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const selectedApi = state.adapter.api.selectedAdapter;
    const services = [];
    const errors = [];
    let needSccdDescriptor = false;
    let missingSccdDescriptor = false;
    let missingCccdDescriptor = false;

    for (let service of serverSetup.children.toArray()) {
        // TODO: At some point we may need/want to support secondary services
        const {
            instanceId,
            uuid,
        } = service;

        if (!uuid || uuid.length === 0) {
            dispatch(showErrorDialog(new ValidationError(invalidUuidErrorMessage)));
            dispatch(selectComponent(instanceId));
            return;
        }

        const factoryService = serviceFactory.createService(service.uuid);
        services.push(factoryService);

        for (let characteristic of service.children.toArray()) {
            const {
                instanceId,
                uuid,
                value,
                properties,
                readPerm,
                writePerm,
                fixedLength,
                maxLength,
            } = characteristic;

            if (!uuid || uuid.length === 0) {
                dispatch(showErrorDialog(new ValidationError(invalidUuidErrorMessage)));
                dispatch(selectComponent(instanceId));
                return;
            }

            let needSccdDescriptor = properties.broadcast || false;
            let needCccdDescriptor = properties.notify || properties.indicate || false;

            const characteristicOptions = {
                readPerm: readPerm.split(' '),
                writePerm: writePerm.split(' '),
                variableLength: !fixedLength,
                maxLength,
            };

            const factoryCharacteristic = serviceFactory.createCharacteristic(
                factoryService,
                uuid,
                value.toArray(),
                properties.toObject(),
                characteristicOptions);

            for (let descriptor of characteristic.children.toArray()) {
                const {
                    instanceId,
                    uuid,
                    value,
                    readPerm,
                    writePerm,
                    fixedLength,
                    maxLength,
                } = descriptor;

                if (!uuid || uuid.length === 0) {
                    dispatch(showErrorDialog(new ValidationError(invalidUuidErrorMessage)));
                    dispatch(selectComponent(instanceId));
                    return;
                }

                if (uuid === SCCD_UUID) {
                    needSccdDescriptor = false;
                } else if (uuid === CCCD_UUID) {
                    needCccdDescriptor = false;
                }

                const descriptorOptions = {
                    readPerm: readPerm.split(' '),
                    writePerm: writePerm.split(' '),
                    variableLength: !fixedLength,
                    maxLength,
                };

                serviceFactory.createDescriptor(
                    factoryCharacteristic,
                    uuid,
                    value.toArray(),
                    descriptorOptions);
            }

            if (needSccdDescriptor) {
                errors.push(new ValidationError('Missing SCCD descriptor (uuid: 2903). All characteristics with broadcast property must have an SCCD descriptor.'));
            }

            if (needCccdDescriptor) {
                errors.push(new ValidationError('Missing CCCD descriptor (uuid: 2902). All characteristics with notify or indicate properties must have a CCCD descriptor.'));
            }

            if (errors.length > 0) {
                dispatch(selectComponent(instanceId));
                dispatch(showErrorDialog(errors));
                return;
            }
        }
    }

    selectedApi.setServices(services, err => {
        if (err) {
            logger.info('Failed to set services');
            logger.info(err);
            return;
        } else {
            dispatch(appliedServerAction(services));
        }
    });
}

function _saveServerSetup(dispatch, getState, filename) {
    if (filename) {
        const adapter = getState().adapter.adapters.get(getState().adapter.selectedAdapter);
        writeFile(filename, JSON.stringify(adapter.serverSetup), error => {
            if (error) {
                dispatch(showErrorDialog(error));
                return;
            }

            logger.info(`Server setup saved to ${filename}.`);
        });
    }
}

function _loadServerSetup(dispatch, files) {
    // Load file into immutable JS structure and replace it in the reducer.
    // The reducer replaces the instanceId's
    if (files && files.length === 1) {
        try {
            const filename = files[0];
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
    }
}

export function selectComponent(component) {
    return selectComponentAction(component);
}

export function setAttributeExpanded(attribute, value) {
    return (dispatch, getState) => {
        _setAttributeExpanded(dispatch, getState, attribute, value);
    };
}

export function addNewService() {
    return addNewServiceAction();
}

export function addNewCharacteristic(parent) {
    return (dispatch, getState) => {
        _addNewCharacteristic(dispatch, getState, parent);
    };
}

export function addNewDescriptor(parent) {
    return (dispatch, getState) => {
        _addNewDescriptor(dispatch, getState, parent);
    };
}

export function saveChangedAttribute(attribute) {
    return (dispatch, getState) => {
        _saveChangedAttribute(dispatch, getState, attribute);
    };
}

export function removeAttribute() {
    return (dispatch, getState) => {
        _removeAttribute(dispatch, getState);
    };
}

export function clearServer() {
    return clearServerAction();
}

export function applyServer() {
    return (dispatch, getState) => {
        _applyServer(dispatch, getState);
    };
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

export function showDiscardDialog() {
    return showDiscardDialogAction();
}

export function hideDiscardDialog() {
    return hideDiscardDialogAction();
}

export function saveServerSetup(filename) {
    return (dispatch, getState) => {
        _saveServerSetup(dispatch, getState, filename);
    };
}

export function loadServerSetup(filename) {
    return dispatch => {
        _loadServerSetup(dispatch, filename);
    };
}
