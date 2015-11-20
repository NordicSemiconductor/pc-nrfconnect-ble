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

import { Map, Record } from 'immutable';
import { api } from 'pc-ble-driver-js';

const ImmutableAdapterState = Record({
    port: null,
    state: null,
    connectedDevices: Map(),
    deviceServers: Map(),
});

const ImmutableAdapter = Record({
    port: null,
    state: null,
    connectedDevices: Map(),
    deviceServices: Map()
});

export default function asImmutable(mutableObject) {
    if(mutableObject instanceof api.Adapter) {
        return getImmutableAdapter(mutableObject);
    } else if(mutableObject instanceof api.AdapterState) {
        return getImmutableAdapterState(mutableObject);
    } else if(mutableObject instanceof api.Device) {
        return getImmutableDevice(mutableObject);
    } else if(mutableObject instanceof api.Service) {
        return getImmutableService(mutableObject);
    } else if(mutableObject instanceof api.Descriptor) {
        return getImmutableDescriptor(mutableObject);
    } else if(mutableObject instanceof api.Characteristic) {
        return getImmutableCharacteristic(mutableObject);
    } else {
        throw 'Explode!';
    }
}

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

export function getImmutableDevice(device) {
    return Map({
        instanceId: device.instanceId,
        role: device.role,
        address: device.address,
        name: device.name,
        connected: device.connected,
    });
}

export function getImmutableAdapterState(adapterState) {
    return Map({
        name: adapterState.name,
        address: adapterState.address,
        available: adapterState.available,
    });
}

export function getImmutableAdapter(adapter) {
    return new ImmutableAdapter({
        port: adapter.state.port,
        state: getImmutableAdapterState(adapter.state),
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
