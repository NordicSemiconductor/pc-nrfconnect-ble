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

export const SHOW_DELETE_DIALOG = 'SERVER_SETUP_SHOW_DELETE_DIALOG';
export const HIDE_DELETE_DIALOG = 'SERVER_SETUP_HIDE_DELETE_DIALOG';

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

function removedAttribute() {
    return {
        type: REMOVED_ATTRIBUTE,
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

function _toggleAttributeExpanded(dispatch, getState, attribute) {
    dispatch(toggledAttributeExpanded(attribute));
    dispatch(selectComponentAction(attribute));
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
        _toggleAttributeExpanded(dispatch, getState, attribute);
    };
}

export function addNewService() {
    return addedNewService();
}

export function addNewCharacteristic(parent) {
    return addedNewCharacteristic(parent);
}

export function addNewDescriptor(parent) {
    return addedNewDescriptor(parent);
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

export function showDeleteConfirmationDialog() {
    return showDeleteDialog();
}

export function hideDeleteConfirmationDialog() {
    return hideDeleteDialog();
}
