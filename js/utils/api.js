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

import { List, Map, Record } from 'immutable';
import { api } from 'pc-ble-driver-js';
import { getUuidName } from './uuid_definitions';

const ImmutableAdapterState = Record({
    instanceId: null,
    port: null,
    available: false,
    scanning: false,
    advertising: false,
    connecting: false,
    address: null,
    name: null,
    firmwareVerison: null,
});

const ImmutableAdapter = Record({
    port: null,
    state: new ImmutableAdapterState(),
    connectedDevices: Map(),
    /*Adapter sub-reducers*/
    deviceDetails: null,
    serverSetup: null,
});

const ImmutableDevice = Record({
    instanceId: null,
    isConnecting: false, // Used by UI to determine visualize we are connecting
    connected: false,
    address: null,
    name: null,
    role: null,
    minConnectionInterval: null,
    maxConnectionInterval: null,
    slaveLatency: null,
    connectionSupervisionTimeout: null,
    services: List(),
    rssi: null,
    scanResponse: false,
    bonded: false,
    securityMode1Levels: null,
    securityMode2Levels: null,
});

const ImmutableProperties = Record({
    broadcast: false,
    read: false,
    write_wo_resp: false,
    write: false,
    notify: false,
    indicate: false,
    auth_signed_wr: false,
    reliable_wr: false,
    wr_aux: false,
});

const ImmutableService = Record({
    instanceId: null,
    deviceInstanceId: null,
    uuid: null,
    name: null,
    handle: null,
    expanded: false,
    discoveringChildren: false,
    children: null,
});

const ImmutableCharacteristic = Record({
    instanceId: null,
    serviceInstanceId: null,
    uuid: null,
    name: null,
    declarationHandle: null,
    valueHandle: null,
    value: List(),
    properties: new ImmutableProperties(),
    expanded: false,
    notifying: false,
    discoveringChildren: false,
    children: null,
    errorMessage: null,
});

const ImmutableDescriptor = Record({
    instanceId: null,
    characteristicInstanceId: null,
    uuid: null,
    name: null,
    handle: null,
    value: List(),
    errorMessage: null,
});

export default function asImmutable(mutableObject) {
    // NOTE: No idea why instanceof does not work for some types
    if (mutableObject.constructor.name === 'AdapterState') {
        return getImmutableAdapterState(mutableObject);
    } else if (mutableObject instanceof api.Adapter) {
        return getImmutableAdapter(mutableObject);
    } else if (mutableObject instanceof api.Device) {
        return getImmutableDevice(mutableObject);
    } else if (mutableObject instanceof api.Service) {
        return getImmutableService(mutableObject);
    } else if (mutableObject instanceof api.Characteristic) {
        return getImmutableCharacteristic(mutableObject);
    } else if (mutableObject instanceof api.Descriptor) {
        return getImmutableDescriptor(mutableObject);
    } else {
        throw 'Explode!';
    }
}

export function getInstanceIds(instanceId) {
    const instanceIds = {
        device: null,
        service: null,
        characteristic: null,
        descriptor: null,
    };

    if (!instanceId) {
        return instanceIds;
    }

    const idArray = instanceId.split('.');

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

export function getImmutableAdapterState(adapterState) {
    return new ImmutableAdapterState({
        instanceId: adapterState.instanceId,
        port: adapterState.port,
        available: adapterState.available,
        scanning: adapterState.scanning,
        advertising: adapterState.advertising,
        connecting: adapterState.connecting,
        address: adapterState.address,
        name: adapterState.name,
        firmwareVerison: adapterState.firmwareVerison,
    });
}

export function getImmutableAdapter(adapter) {
    return new ImmutableAdapter({
        port: adapter.state.port,
        state: getImmutableAdapterState(adapter.state),
        connectedDevices: Map(),
        /*Adapter sub-reducers*/
        deviceDetails: undefined,
    });
}

export function getImmutableDevice(device) {
    return new ImmutableDevice({
        instanceId: device.instanceId,
        connected: device.connected,
        address: device.address,
        name: device.name,
        role: device.role,
        minConnectionInterval: device.minConnectionInterval,
        maxConnectionInterval: device.maxConnectionInterval,
        slaveLatency: device.slaveLatency,
        connectionSupervisionTimeout: device.connectionSupervisionTimeout,
        rssi: device.rssi,
        scanResponse: device.scanResponse,
    });
}

export function getImmutableProperties(properties) {
    return new ImmutableProperties({
        broadcast: properties.broadcast,
        read: properties.read,
        write_wo_resp: properties.write_wo_resp,
        write: properties.write,
        notify: properties.notify,
        indicate: properties.indicate,
        auth_signed_wr: properties.auth_signed_wr,
        reliable_wr: properties.reliable_wr,
        wr_aux: properties.wr_aux,
    });
}

export function getImmutableService(service) {
    return new ImmutableService({
        instanceId: service.instanceId,
        deviceInstanceId: service.deviceInstanceId,
        uuid: service.uuid,
        name: service.name,
        handle: service.startHandle,
        children: service.children,
    });
}

export function getImmutableCharacteristic(characteristic) {
    const properties = characteristic.properties || {};
    return new ImmutableCharacteristic({
        instanceId: characteristic.instanceId,
        serviceInstanceId: characteristic.serviceInstanceId,
        uuid: characteristic.uuid,
        name: characteristic.name,
        declarationHandle: characteristic.declarationHandle,
        valueHandle: characteristic.valueHandle,
        value: List(characteristic.value),
        properties: getImmutableProperties(properties),
        children: characteristic.children,
    });
}

export function getImmutableDescriptor(descriptor) {
    return new ImmutableDescriptor({
        instanceId: descriptor.instanceId,
        characteristicInstanceId: descriptor.characteristicInstanceId,
        uuid: descriptor.uuid,
        name: descriptor.name,
        handle: descriptor.handle,
        value: List(descriptor.value),
    });
}
