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

import { Map } from 'immutable';

export function getInstanceIds(attribute) {
    const idArray = attribute.instanceId.split('.');
    const instanceIds = {
        device: null,
        service: null,
        characteristic: null,
        descriptor: null,
    };

    if (idArray.length > 1) {
        instanceIds.device = idArray.slice(0, 2).join('.');
    }

    if (idArray.length > 2) {
        instanceIds.service = idArray.slice(0, 3).join('.');
    }

    if (idArray.length > 3) {
        instanceIds.characteristic = idArray.slice(0, 4).join('.');
    }

    if (idArray.length > 4) {
        instanceIds.descriptor = idArray.slice(0, 5).join('.');
    }

    return instanceIds;
}

export function getImmutableService(service) {
    return Map({
        instanceId: service.instanceId,
        deviceInstanceId: service.deviceInstanceId,
        name: service.name,
        uuid: service.uuid,
        discoveringChildren: false,
        children: null,
    });
}

export function getImmutableCharacteristic(characteristic) {
    // TODO: Parse characteristic and create immutable characteristic.
}

export function getImmutableDescriptor(descriptor) {
    // TODO: Parse descriptor and create immutable descriptor.
}

export function getNodeStatePath(node) {
    const nodeInstanceIds = getInstanceIds(node);
    const nodeStatePath = ['devices', nodeInstanceIds.device];

    if (nodeInstanceIds.service) {
        nodeStatePath.push('children', nodeInstanceIds.service);
    }

    if (nodeInstanceIds.characteristic) {
        nodeStatePath.push('children', nodeInstanceIds.characteristic);
    }

    if (nodeInstanceIds.descriptor) {
        nodeStatePath.push('children', nodeInstanceIds.descriptor);
    }

    return nodeStatePath;
}
