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

import { getInstanceIds } from '../utils/api';

function selectComponentAction(component) {
    return {
        type: SELECT_COMPONENT,
        component: component,
    };
}

function _toggleAttributeExpanded(dispatch, getState, attribute) {
    dispatch(toggledAttributeExpanded(attribute));
    dispatch(selectComponentAction(attribute));
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

export function toggleAttributeExpanded(attribute) {
    return (dispatch, getState) => {
        return _toggleAttributeExpanded(dispatch, getState, attribute);
    };
}
