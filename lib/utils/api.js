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

import { List, Map, OrderedMap, Record } from 'immutable';

const ImmutableAdapterState = Record({
    instanceId: null,
    port: null,
    serialNumber: null,
    available: false,
    scanning: false,
    advertising: false,
    connecting: false,
    address: null,
    name: null,
    firmwareVerison: null,
});

export const ImmutableAdapter = Record({
    state: new ImmutableAdapterState(),
    connectedDevices: Map(),
    /* Adapter sub-reducers */
    deviceDetails: null,
    serverSetup: null,
    security: null,
    isServerSetupApplied: false,
});

export const ImmutableDevice = Record({
    instanceId: null,
    isConnecting: false, // Used by UI to determine visualize we are connecting
    connected: false,
    address: null,
    addressType: null,
    advType: null,
    flags: List(),
    adData: OrderedMap(),
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
    securityMode: null,
    securityLevel: null,
    isExpanded: false,
    ownPeriphInitiatedPairingPending: false,
});

const ImmutableProperties = Record({
    broadcast: false,
    read: false,
    writeWoResp: false,
    write: false,
    notify: false,
    indicate: false,
    authSignedWr: false,
    reliableWr: false,
    wrAux: false,
});

export const ImmutableService = Record({
    instanceId: null,
    deviceInstanceId: null,
    uuid: null,
    name: null,
    handle: null,
    expanded: false,
    discoveringChildren: false,
    children: null,
});

export const ImmutableCharacteristic = Record({
    instanceId: null,
    serviceInstanceId: null,
    uuid: null,
    name: null,
    declarationHandle: null,
    valueHandle: null,
    value: List(),
    properties: new ImmutableProperties(),
    readPerm: null,
    writePerm: null,
    fixedLength: false,
    maxLength: null,
    expanded: false,
    discoveringChildren: false,
    children: null,
    errorMessage: null,
});

export const ImmutableDescriptor = Record({
    instanceId: null,
    characteristicInstanceId: null,
    uuid: null,
    name: null,
    handle: null,
    value: List(),
    readPerm: null,
    writePerm: null,
    fixedLength: false,
    maxLength: null,
    errorMessage: null,
});

export function getInstanceIds(instanceId) {
    const instanceIds = {
        address: null,
        device: null,
        service: null,
        characteristic: null,
        descriptor: null,
    };

    if (!instanceId) {
        return instanceIds;
    }

    const idArray = instanceId.split('.');

    if (idArray.length > 0) {
        instanceIds.address = idArray[0];
    }

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
        serialNumber: adapterState.serialNumber,
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
        /* Adapter sub-reducers */
        deviceDetails: undefined,
        serverSetup: undefined,
        security: undefined,
    });
}

export function getImmutableDevice(device) {
    return new ImmutableDevice({
        instanceId: device.instanceId,
        connected: device.connected,
        address: device.address,
        addressType: device.addressType,
        name: device.name,
        advType: device.advType,
        adData: Map(device.adData),
        flags: List(device.flags),
        role: device.role,
        minConnectionInterval: device.minConnectionInterval,
        maxConnectionInterval: device.maxConnectionInterval,
        slaveLatency: device.slaveLatency,
        connectionSupervisionTimeout: device.connectionSupervisionTimeout,
        services: List(device.services),
        rssi: device.rssi,
        scanResponse: device.scanResponse,
        ownPeriphInitiatedPairingPending: device.ownPeriphInitiatedPairingPending,
    });
}

export function getImmutableProperties(properties) {
    return new ImmutableProperties({
        broadcast: properties.broadcast,
        read: properties.read,
        writeWoResp: properties.writeWoResp || properties.write_wo_resp,
        write: properties.write,
        notify: properties.notify,
        indicate: properties.indicate,
        authSignedWr: properties.authSignedWr || properties.auth_signed_wr,
        reliableWr: properties.reliableWr || properties.reliable_wr,
        wrAux: properties.wrAux ? properties.wrAux : properties.wr_aux,
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
        readPerm: characteristic.readPerm,
        writePerm: characteristic.writePerm,
        fixedLength: characteristic.fixedLength,
        maxLength: characteristic.maxLength,
        children: characteristic.children,
    });
}

function getImmutableDescriptorValue(descriptor) {
    const {
        uuid,
        value,
    } = descriptor;

    const descriptorInstanceIds = getInstanceIds(descriptor.instanceId);

    if (descriptorInstanceIds.device === 'local.server' && uuid === '2902') {
        let cccdValue = new Map();
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length; i += 1) {
            const deviceInstanceId = keys[i];
            cccdValue = cccdValue.set(deviceInstanceId, List(value[deviceInstanceId]));
        }

        return cccdValue;
    }

    return List(value);
}

export function getImmutableDescriptor(descriptor) {
    const value = getImmutableDescriptorValue(descriptor);
    return new ImmutableDescriptor({
        instanceId: descriptor.instanceId,
        characteristicInstanceId: descriptor.characteristicInstanceId,
        uuid: descriptor.uuid,
        name: descriptor.name,
        handle: descriptor.handle,
        value,
        readPerm: descriptor.readPerm,
        writePerm: descriptor.writePerm,
        fixedLength: descriptor.fixedLength,
        maxLength: descriptor.maxLength,
    });
}
