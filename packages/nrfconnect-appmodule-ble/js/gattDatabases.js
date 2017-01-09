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

/*
 *  We assume that parent is always found before its children.
 */

import _ from 'underscore';

import bleDriver from 'pc-ble-driver-js';
import getUuidName from './utils/uuid_definitions';

const SERVICE_UUID = '0x2800';
const CHARACTERISTIC_UUID = '0x2803';

class GattDatabase {
    constructor(connectionHandle) {
        this.connectionHandle = connectionHandle;
        this.services = [];
    }

    getPrettyGattDatabase() {
        const prettyDatabase = Object.assign(new GattDatabase(), this);
        const services = prettyDatabase.services;

        for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
            const characteristics = services[serviceIndex].characteristics;

            for (let characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex++) {
                const characteristic = characteristics[characteristicIndex];

                const valueDescriptor = characteristic.descriptors.find(descriptor => characteristic.valueHandle === descriptor.handle);
                const descriptors = characteristic.descriptors.filter(descriptor => characteristic.valueHandle === descriptor.handle);

                characteristic.value = this.valueToString(valueDescriptor.value);
                characteristic.descriptors = descriptors;
                characteristic.parent = services[serviceIndex];

                for (let descriptorIndex = 0; descriptorIndex < descriptors.length; descriptorIndex++) {
                    const descriptor = descriptors[descriptorIndex];
                    descriptor.value = this.valueToString(descriptor.value);
                    descriptor.parent = characteristic;
                }
            }
        }

        return prettyDatabase;
    }

    valueToString(value) {
        let valueString = '';

        for (let i = 0; i < value.length; i++) {
            const byteString = '0' + value[i].toString(16);
            valueString += byteString.slice(-2) + '-';
        }

        return valueString.slice(0, -1).toUpperCase();
    }

    findAttribute(handle) {
        return this.services.reduce((previousValue, currentValue) => previousValue || currentValue.findAttribute(handle), undefined);
    }

    addService(service) {
        this.services.push(service);
    }

    removeService(service) {
        this.services = _.reject(this.services, element => element === service);
    }
}

class Attribute {
    constructor(parent, handle) {
        this.parent = parent;
        this.handle = handle;
    }

    findAttribute(handle) {
        if (this.handle === handle) {
            return this;
        }

        if (this._children) {
            return this._children.reduce((previousValue, currentValue) => previousValue || currentValue.findAttribute(handle), undefined);
        }
    }

    arrayToString(array) {
        let string = '';

        for (let i = array.length - 1; i >= 0; i--) {
            let byteString = array[i].toString(16);
            byteString = ('0' + byteString).slice(-2);
            string += byteString;
        }

        string = '0x' + string.toUpperCase();

        return string;
    }

    arrayToInt(array) {
        const buffer = new Buffer(array);

        return buffer.readUInt16LE();
    }
}

class Service extends Attribute {
    constructor(parent, handle, serviceUuid) {
        super(parent, handle);
        this.parent.addService(this);
        this.uuid = SERVICE_UUID;

        if (serviceUuid) {
            this.serviceUuid = serviceUuid;
            this.name = getUuidName(this.serviceUuid);
        } else {
            this.name = getUuidName(SERVICE_UUID);
        }

        this.characteristics = [];
        this._children = this.characteristics;
        this.expanded = false;
    }

    parseData(data, length, readOffset) {
        this.serviceUuid = this.arrayToString(data);
        this.name = getUuidName(this.serviceUuid);
    }

    addCharacteristic(characteristic) {
        this.characteristics.push(characteristic);
    }

    removeCharacteristic(characteristic) {
        this.characteristics = _.reject(this.characteristics, element => element === characteristic);
    }

    removeFromParent() {
        this.parent.removeService(this);
    }
}

class Characteristic extends Attribute {
    constructor(parent, handle, characteristicUuid, valueHandle, properties) {
        super(parent, handle);
        this.parent.addCharacteristic(this);
        this.uuid = CHARACTERISTIC_UUID;

        if (characteristicUuid) {
            this.uuid = characteristicUuid;
            this.name = getUuidName(this.characteristicUuid);
        } else {
            this.name = getUuidName(CHARACTERISTIC_UUID);
        }

        this.valueHandle = valueHandle;
        this.properties = properties;

        this.descriptors = [];
        this._children = this.descriptors;
        this.expanded = false;
    }

    parseData(data, length, readOffset) {
        this.properties = new Properties(data[0]);
        this.valueHandle = this.arrayToInt(data.slice(1, 3));
        this.characteristicUuid = this.arrayToString(data.slice(3));
        this.name = getUuidName(this.characteristicUuid);
    }

    addDescriptor(descriptor) {
        this.descriptors.push(descriptor);
    }

    removeDescriptor(descriptor) {
        this.descriptors = _.reject(this.descriptors, element => element === descriptor);
    }

    removeFromParent() {
        this.parent.removeCharacteristic(this);
    }
}

class Descriptor extends Attribute {
    constructor(parent, handle, uuid, value) {
        super(parent, handle);
        this.parent.addDescriptor(this);
        this.uuid = uuid;
        this.name = getUuidName(uuid);
        this.value = value || [];
        this.expanded = false;
    }

    parseData(data, length, readOffset) {
        const remainingData = this.value.slice(0, readOffset);
        this.value = remainingData.concat(data);
    }

    removeFromParent() {
        this.parent.removeDescriptor(this);
    }
}

class Properties {
    constructor(properties, extendedProperties) {
        if (properties) {
            this.broadcast = properties & 0x01;
            this.read = properties & 0x02;
            this.writeWithoutResponse = properties & 0x04;
            this.write = properties & 0x08;
            this.notify = properties & 0x10;
            this.indicate = properties & 0x20;
            this.authenticatedSignedWrites = properties & 0x40;
            this.extendedProperties = properties & 0x80;
        }

        if (extendedProperties && this.extendedProperties) {
            this.reliableWrite = extendedProperties & 0x01;
            this.writeAuxiliary = extendedProperties & 0x02;
        }
    }

    getProperties() {
        const properties = [];

        if (this.broadcast) {
            properties.push('Broadcast');
        }

        if (this.read) {
            properties.push('Read');
        }

        if (this.writeWithoutResponse) {
            properties.push('Write w/o response');
        }

        if (this.write) {
            properties.push('Write');
        }

        if (this.notify) {
            properties.push('Notify');
        }

        if (this.indicate) {
            properties.push('Indicate');
        }

        if (this.authenticatedSignedWrites) {
            properties.push('Authenticated signed writes');
        }

        if (this.extendedProperties) {
            properties.push('Extended properties');
        }

        if (this.reliableWrite) {
            properties.push('Reliable write');
        }

        if (this.writeAuxiliary) {
            properties.push('Write auxiliary');
        }

        return properties;
    }
}

class GattDatabases {

    constructor() {
        // TODO: Keep a example database structure?
        this.gattDatabases = [];
    }
/*
[{
    connectionHandle: 1,
    services:[{
        handle: 1,
        name: 'Health Thermometer',
        uuid: '0x1809',
        characteristics: [{
            handle: 2,
            valueHandle: 3,
            name: 'Temperature',
            uuid: '0x2A1D',
            value: '37,5C' // must be manually read
        },
        {
            name: 'Measurement Interval',
            uuid: '0x2A1D',
            value: '300 sec', // must be manually read
            descriptors: [{
                name: 'Client Characteristic Configuration',
                uuid: '0x0028',
                value: '0x00' // must be manually read
            }]
        }]
    }]
}];
*/

    onDescriptorDiscoverResponseEvent(event) {
        if (event.gatt_status != bleDriver.BLE_GATT_STATUS_SUCCESS) {
            //TODO: Error handling, probably do nothing. Should it have gotten this far, if yes logging?
            return;
        }

        const connectionHandle = event.conn_handle;

        for (let i = 0; i < event.count; i++) {
            const discoveredAttribute = event.descs[i];
            const handle = discoveredAttribute.handle;

            const uuid = this.uuidIntToUuidString(discoveredAttribute.uuid.uuid, discoveredAttribute.uuid.type);

            if (uuid == SERVICE_UUID) {
                const gattDatabase = this.getGattDatabase(connectionHandle);
                const service = new Service(gattDatabase, handle);
                this.insertGattObjectInList(gattDatabase.services, service);
            } else if (uuid == CHARACTERISTIC_UUID) {
                const parentService = this.findParentService(connectionHandle, handle);
                const characteristic = new Characteristic(parentService, handle);
                this.insertGattObjectInList(parentService.characteristics, characteristic);
            } else {
                const parentCharacteristic = this.findParentCharacteristic(connectionHandle, handle);
                const descriptor = new Descriptor(parentCharacteristic, handle, uuid);
                this.insertGattObjectInList(parentCharacteristic.descriptors, descriptor);
            }
        }
    }

    onReadResponse(event) {
        if (event.gatt_status != bleDriver.BLE_GATT_STATUS_SUCCESS) {
            //TODO: Error handling, probably do nothing. Should it have gotten this far, if yes logging?
            return;
        }

        const connectionHandle = event.conn_handle;
        const handle = event.handle;
        const data = event.data.toJSON().data;
        const length = event.len;
        const readOffset = event.offset;

        const gattDatabase = this.getGattDatabase(connectionHandle);
        const attribute = gattDatabase.findAttribute(handle);

        attribute.parseData(data, length, readOffset);
    }

    getHandleList(connectionHandle) {
        const handleList = [];
        const gattDatabase = this.getGattDatabase(connectionHandle);
        const services = gattDatabase.services;

        for (let serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
            const service = services[serviceIndex];
            const characteristics = service.characteristics;
            handleList.push(service.handle);

            for (let characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex++) {
                const characteristic = characteristics[characteristicIndex];
                const descriptors = characteristic.descriptors;
                handleList.push(characteristic.handle);

                for (let descriptorIndex = 0; descriptorIndex < descriptors.length; descriptorIndex++) {
                    const descriptor = descriptors[descriptorIndex];
                    handleList.push(descriptor.handle);
                }
            }
        }

        return handleList;
    }

    findParentService(connectionHandle, handle) {
        const gattDatabase = this.getGattDatabase(connectionHandle);
        let previousService;

        for (let i = 0; i < gattDatabase.services.length; i++) {
            const service = gattDatabase.services[i];
            const serviceHandle = service.handle;

            if (serviceHandle > handle) {
                break;
            }

            previousService = service;
        }

        return previousService;
    }

    findParentCharacteristic(connectionHandle, handle) {
        const parentService = this.findParentService(connectionHandle, handle);
        let previousCharacteristic;

        for (let i = 0; i < parentService.characteristics.length; i++) {
            const characteristic = parentService.characteristics[i];
            const characteristicHandle = characteristic.handle;

            if (characteristicHandle > handle) {
                break;
            }

            previousCharacteristic = characteristic;
        }

        return previousCharacteristic;
    }

    uuidIntToUuidString(uuid, type) {
        let uuidString = uuid.toString(16).toUpperCase();

        uuidString = '000' + uuidString;
        uuidString =  uuidString.slice(-4);
        uuidString = '0x' + uuidString;

        if (type > bleDriver.BLE_UUID_TYPE_BLE) {
            uuidString += '*';
        }

        return uuidString;
    }

    insertGattObjectInList(list, gattObject) {
        const gattObjectHandle = gattObject.handle;

        for (let i = 0; i < list.length; i++) {
            if (list[i].handle == gattObjectHandle) {
                list[i] = gattObject;
                return;
            }
        }

        list.push(gattObject);
    }

    getGattDatabase(connectionHandle) {
        for (let i = 0; i < this.gattDatabases.length; i++) {
            if (this.gattDatabases[i].connectionHandle == connectionHandle) {
                return this.gattDatabases[i];
            }
        }

        const gattDatabase = new GattDatabase(connectionHandle);

        this.gattDatabases.push(gattDatabase);

        return gattDatabase;
    }

    removeGattDatabase(connectionHandle) {
        const indexOfItemToDelete = this.gattDatabases.findIndex(function (gattDatabase) {
            return gattDatabase.connectionHandle === connectionHandle;
        });

        if (indexOfItemToDelete !== -1) {
            this.gattDatabases.splice(indexOfItemToDelete, 1);
        }

    }

    getPrettyGattDatabases() {
        const prettyDatabases = Object.assign(new GattDatabases(), this);
        const gattDatabases = prettyDatabases.gattDatabases;

        for (let gattDatabaseIndex = 0; gattDatabaseIndex < gattDatabases.length; gattDatabaseIndex++) {
            gattDatabases[gattDatabaseIndex] = gattDatabases[gattDatabaseIndex].getPrettyGattDatabase();
        }

        return prettyDatabases;
    }
}

module.exports = { GattDatabases, GattDatabase, Service, Characteristic, Descriptor, Properties };
