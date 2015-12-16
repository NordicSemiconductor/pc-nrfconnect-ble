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

export const LOAD = 'SERVER_SETUP_LOAD';

import { getInstanceIds } from '../utils/api';
import { writeFile, readFileSync } from 'fs';

import { api } from 'pc-ble-driver-js';
import { logger } from '../logging';
import { showErrorDialog } from './errorDialogActions';

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

function _addNewCharacteristic(dispatch, getState, parent) {
    const state = getState();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const parentInstanceIds = getInstanceIds(parent.instanceId);

    if (parentInstanceIds.service === 'local.server.0' || parentInstanceIds.service === 'local.server.1') {
        // Not allowed to remove GAP or GATT service and their children.
        return;
    }

    dispatch(addNewCharacteristicAction(parent));
}

function _addNewDescriptor(dispatch, getState, parent) {
    const state = getState();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const parentInstanceIds = getInstanceIds(parent.instanceId);

    if (parentInstanceIds.service === 'local.server.0' || parentInstanceIds.service === 'local.server.1') {
        // Not allowed to remove GAP or GATT service and their children.
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
    //TODO: if attribute is gap or gatt service (check if first in list of services?)
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
    const serviceFactory = new api.ServiceFactory();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const selectedApi = state.adapter.api.selectedAdapter;
    const services = [];
    let needSccdDescriptor = false;
    let missingSccdDescriptor = false;
    let missingCccdDescriptor = false;

    for (let service of serverSetup.children.toArray()) {
        // TODO: At some point we may need/want to support secondary services
        const {
            uuid,
        } = service;

        const factoryService = serviceFactory.createService(service.uuid);
        services.push(factoryService);

        for (let characteristic of service.children.toArray()) {
            const {
                uuid,
                value,
                properties,
                readPerm,
                writePerm,
                fixedLength,
                maxLength,
            } = characteristic;

            let needSccdDescriptor = properties.broadcast || false;
            let needCccdDescriptor = properties.notify || properties.indicate || false;

            // TODO: At some point we need to do something with characteristicProperties, separate out the BLE properties or rename it to options.
            const characteristicProperties = {
                properties: properties.toObject(),
                readPerm: readPerm.split(' '),
                writePerm: writePerm.split(' '),
                variableLength: !fixedLength,
                maxLength,
            };

            const factoryCharacteristic = serviceFactory.createCharacteristic(factoryService, uuid, value.toArray(), characteristicProperties);

            for (let descriptor of characteristic.children.toArray()) {
                const {
                    uuid,
                    value,
                    readPerm,
                    writePerm,
                    fixedLength,
                    maxLength,
                } = descriptor;

                if (uuid === '2903') {
                    needSccdDescriptor = false;
                } else if (uuid === '2902') {
                    needCccdDescriptor = false;
                }

                const descriptorProperties = {
                    readPerm: readPerm.split(' '),
                    writePerm: writePerm.split(' '),
                    variableLength: !fixedLength,
                    maxLength,
                };

                serviceFactory.createDescriptor(factoryCharacteristic, uuid, value.toArray(), descriptorProperties);
            }

            if (needSccdDescriptor) {
                missingSccdDescriptor = true;
            }

            if (needCccdDescriptor) {
                missingCccdDescriptor = true;
            }
        }
    }

    let errors = [];

    if (missingSccdDescriptor) {
        errors.push('Missing SCCD descriptor (uuid: 2903). All characteristics with broadcast property must have an SCCD descriptor.');
    }

    if (missingCccdDescriptor) {
        errors.push('Missing CCCD descriptor (uuid: 2902). All characteristics with notify or indicate properties must have a CCCD descriptor.');
    }

    if (errors.length > 0) {
        dispatch(showErrorDialog(errors));
        return;
    }

    selectedApi.setServices(services, err => {
        if (err) {
            // TODO: log something
            console.log('failed to set services');
            console.log(err);
            dispatch(showErrorDialog(err));
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

function _loadServerSetup(dispatch, filename) {
    // Load file into immutable JS structure and replace it in the reducer.
    // The reducer replaces the instanceId's
    if (filename && filename.length === 1) {
        try {
            const setup = readFileSync(filename[0]);
            const setupObj = JSON.parse(setup);

            if (!setupObj) {
                throw new Error('Illegal format on server setup file.');
            }

            dispatch(loadAction(setupObj));
            logger.info(`Server setup loaded from ${filename}.`);
        } catch (e) {
            dispatch(showErrorDialog(e.message));
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

export function saveServerSetup(filename) {
    return (dispatch, getState) => {
        _saveServerSetup(dispatch, getState, filename);
    };
}

export function loadServerSetup(filename) {
    return (dispatch) => {
        _loadServerSetup(dispatch, filename);
    };
}
