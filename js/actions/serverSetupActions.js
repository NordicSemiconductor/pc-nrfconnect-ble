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
export const TOGGLED_ATTRIBUTE_EXPANDED = 'SERVER_SETUP_TOGGLED_ATTRIBUTE_EXPANDED';

export const ADDED_NEW_SERVICE = 'SERVER_SETUP_ADDED_NEW_SERVICE';
export const ADDED_NEW_CHARACTERISTIC = 'SERVER_SETUP_NEW_CHARACTERISTIC';
export const ADDED_NEW_DESCRIPTOR = 'SERVER_SETUP_NEW_DESCRIPTOR';
export const CHANGED_ATTRIBUTE = 'SERVER_SETUP_CHANGED_ATTRIBUTE';
export const REMOVED_ATTRIBUTE = 'SERVER_SETUP_REMOVED_ATTRIBUTE';

export const CLEARED_SERVER = 'SERVER_SETUP_CLEARED_SERVER';
export const APPLIED_SERVER = 'SERVER_SETUP_APPLIED_SERVER';

export const SHOW_DELETE_DIALOG = 'SERVER_SETUP_SHOW_DELETE_DIALOG';
export const HIDE_DELETE_DIALOG = 'SERVER_SETUP_HIDE_DELETE_DIALOG';

export const SAVE_ERROR = 'SERVER_SETUP_SAVE_ERROR';
export const LOAD_ERROR = 'SERVER_SETUP_LOAD_ERROR';
export const LOAD = 'SERVER_SETUP_LOAD';

import { getInstanceIds } from '../utils/api';
import { writeFile, readFileSync } from 'fs';

import { api } from 'pc-ble-driver-js';

function toggledAttributeExpanded(attribute) {
    return {
        type: TOGGLED_ATTRIBUTE_EXPANDED,
        attribute,
    };
}

function selectComponentAction(component) {
    return {
        type: SELECT_COMPONENT,
        component: component,
    };
}

function addedNewService() {
    return {
        type: ADDED_NEW_SERVICE,
    };
}

function addedNewCharacteristic(parent) {
    return {
        type: ADDED_NEW_CHARACTERISTIC,
        parent,
    };
}

function addedNewDescriptor(parent) {
    return {
        type: ADDED_NEW_DESCRIPTOR,
        parent,
    };
}

function changedAttribute(attribute) {
    return {
        type: CHANGED_ATTRIBUTE,
        attribute,
    };
}

function removedAttribute() {
    return {
        type: REMOVED_ATTRIBUTE,
    };
}

function clearedServer() {
    return {
        type: CLEARED_SERVER,
    };
}

function appliedServer(server) {
    return {
        type: APPLIED_SERVER,
        server: server,
    };
}

function showDeleteDialog() {
    return {
        type: SHOW_DELETE_DIALOG,
    };
}

function hideDeleteDialog() {
    return {
        type: HIDE_DELETE_DIALOG,
    };
}

function saveErrorAction(error) {
    return {
        type: SAVE_ERROR,
        error,
    };
}

function loadErrorAction(error) {
    return {
        type: LOAD_ERROR,
        error,
    };
}

function loadAction(setup) {
    return {
        type: LOAD,
        setup,
    };
}

function _toggleAttributeExpanded(dispatch, getState, attribute) {
    dispatch(toggledAttributeExpanded(attribute));
    dispatch(selectComponentAction(attribute));
}

function _addNewCharacteristic(dispatch, getState, parent) {
    const state = getState();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const parentInstanceIds = getInstanceIds(parent.instanceId);

    if (parentInstanceIds.service === 'local.server.0' || parentInstanceIds.service === 'local.server.1') {
        // Not allowed to remove GAP or GATT service and their children.
        return;
    }

    dispatch(addedNewCharacteristic(parent));
}

function _addNewDescriptor(dispatch, getState, parent) {
    const state = getState();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const parentInstanceIds = getInstanceIds(parent.instanceId);

    if (parentInstanceIds.service === 'local.server.0' || parentInstanceIds.service === 'local.server.1') {
        // Not allowed to remove GAP or GATT service and their children.
        return;
    }

    dispatch(addedNewDescriptor(parent));
}

function _saveChangedAttribute(dispatch, getState, attribute) {
    dispatch(changedAttribute(attribute));
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

    dispatch(removedAttribute());
}

function _applyGapServiceCharacteristics(apiAdapter, gapService) {
    for (let characteristic of gapService.children.toArray()) {
        if (characteristic.uuid == '2A00') {
            apiAdapter.setDeviceName(characteristic.value.toArray(), characteristic.writePerm.split(' '), err => {});
        }

        if (characteristic.uuid == '2A01') {
            valueArray = characteristic.value.toArray();
            appearanceValue = valueArray[0];
            appearanceValue += valueArray[1] << 8;
            apiAdapter.setAppearance(appearanceValue, err => {});
        }

        // TODO: Add PeripheralPreferredConnectionParameters, or do we continue to ignore it?
    }
}

function _applyServer(dispatch, getState) {
    console.log('apply server');
    const state = getState();
    const serviceFactory = new api.ServiceFactory();
    const serverSetup =  state.adapter.adapters.get(state.adapter.selectedAdapter).serverSetup;
    const selectedApi = state.adapter.api.selectedAdapter;
    const services = [];

    for (let service of serverSetup.children.toArray()) {
        // TODO: At some point we may need/want to support secondary services
        const {
            uuid,
        } = service;

        if (uuid === '1800') {
            _applyGapServiceCharacteristics(selectedApi, service);
            continue;
        }

        if (uuid === '1801') {
            continue;
        }

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

                const descriptorProperties = {
                    readPerm: readPerm.split(' '),
                    writePerm: writePerm.split(' '),
                    variableLength: !fixedLength,
                    maxLength,
                };

                serviceFactory.createDescriptor(factoryCharacteristic, uuid, value.toArray(), descriptorProperties);
            }
        }
    }

    selectedApi.setServices(services, err => {
        if (err) {
            // TODO: log something
            console.log('failed to set services');
            console.log(err);
            return;
        } else {
            dispatch(appliedServer(services));
        }
    });

    // TODO: dispatch appliedServer action to deviceDetail who wants to know how the new local server looks.
}

function _saveServerSetup(dispatch, getState, adapter, filename) {
    if (filename) {
        writeFile(filename, JSON.stringify(adapter.serverSetup), error => {
            if(error) {
                // TODO: implement functionality in reducer for this error
                dispatch(saveErrorAction(error));
            }
        });
    }
}

function _loadServerSetup(dispatch, getState, selectedAdapter, filename) {
    // TODO: implement loading of server setup

    // Load file into immutable JS structure and replace it in the reducer.
    // The reducer replaces the instanceId's
    if (filename && filename.length === 1) {
        const setup = readFileSync(filename[0]);
        const setupObj = JSON.parse(setup);
        dispatch(loadAction(setupObj));
    }
}

export function selectComponent(component) {
    return selectComponentAction(component);
}

export function toggleAttributeExpanded(attribute) {
    return (dispatch, getState) => {
        _toggleAttributeExpanded(dispatch, getState, attribute);
    };
}

export function addNewService() {
    return addedNewService();
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
    return clearedServer();
}

export function applyServer() {
    return (dispatch, getState) => {
        _applyServer(dispatch, getState);
    };
}

export function showDeleteConfirmationDialog() {
    return showDeleteDialog();
}

export function hideDeleteConfirmationDialog() {
    return hideDeleteDialog();
}

export function saveServerSetup(adapter, filename) {
    return (dispatch, getState) => {
        _saveServerSetup(dispatch, getState, adapter, filename);
    };
}

export function loadServerSetup(adapter, filename) {
    return (dispatch, getState) => {
        _loadServerSetup(dispatch, getState, adapter, filename);
    };
}
