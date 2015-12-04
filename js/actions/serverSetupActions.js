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

import { getInstanceIds } from '../utils/api';

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

function removedAttribute(attribute) {
    return {
        type: REMOVED_ATTRIBUTE,
        attribute,
    };
}

function _toggleAttributeExpanded(dispatch, getState, attribute) {
    dispatch(toggledAttributeExpanded(attribute));
    dispatch(selectComponentAction(attribute));
}

function _addNewService(dispatch, getState) {
    dispatch(addedNewService());
}

function _addNewCharacteristic(dispatch, getState, parent) {
    dispatch(addedNewCharacteristic(parent));
}

function _addNewDescriptor(dispatch, getState, parent) {
    dispatch(addedNewDescriptor(parent));
}

function _saveChangedAttribute(dispatch, getState, attribute) {
    dispatch(changedAttribute(attribute));
}

function _removeAttribute(dispatch, getState, attribute) {
    //TODO: if attribute is gap or gatt service (check if first in list of services?)
    dispatch(removedAttribute(attribute));
}

export function selectComponent(component) {
    return selectComponentAction(component);
}

export function toggleAttributeExpanded(attribute) {
    return (dispatch, getState) => {
        return _toggleAttributeExpanded(dispatch, getState, attribute);
    };
}

export function addNewService() {
    return (dispatch, getState) => {
        return _addNewService(dispatch, getState);
    };
}

export function addNewCharacteristic(parent) {
    return (dispatch, getState) => {
        return _addNewCharacteristic(dispatch, getState, parent);
    };
}

export function addNewDescriptor(parent) {
    return (dispatch, getState) => {
        return _addNewDescriptor(dispatch, getState, parent);
    };
}

export function saveChangedAttribute(attribute) {
    return (dispatch, getState) => {
        return _saveChangedAttribute(dispatch, getState, attribute);
    };
}

export function removeAttribute(attribute) {
    return (dispatch, getState) => {
        return _removeAttribute(dispatch, getState, attribute);
    };
}
