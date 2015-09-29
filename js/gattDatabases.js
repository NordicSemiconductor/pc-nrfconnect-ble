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

"use strict";

/*
 *  We assume that parent is always found before its children.
 */

import _ from 'underscore';

//import logger from './logging';
import bleDriver from 'pc-ble-driver-js';
import uuidDefinitions from './utils/uuid_definitions';

const SERVICE_UUID = "0x2800";
const CHARACTERISTIC_UUID = "0x2803";

class GattDatabase {
    constructor(connectionHandle) {
        this.connectionHandle = connectionHandle;
        this.services = [];
    }

    getPrettyGattDatabase() {
        var prettyDatabase = Object.assign({}, this);

        var findPredicate = function(characteristic, descriptor) {
            return descriptor.handle === characteristic.valueHandle;
        };

        var rejectPredicate = function(characteristic, descriptor) {
            return descriptor.handle !== characteristic.valueHandle;
        };

        var services = prettyDatabase.services;

        for (var serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
            var characteristics = services[serviceIndex].characteristics;

            for (var characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex++) {
                var characteristic = characteristics[characteristicIndex];

                var valueDescriptor = characteristic.descriptors.find(findPredicate.bind(undefined, characteristic));
                var descriptors = characteristic.descriptors.filter(rejectPredicate.bind(undefined, characteristic));

                characteristic.value = this.valueToString(valueDescriptor.value);
                characteristic.descriptors = descriptors;
                characteristic.parent = services[serviceIndex];

                for (var descriptorIndex = 0; descriptorIndex < descriptors.length; descriptorIndex++) {
                    var descriptor = descriptors[descriptorIndex];
                    descriptor.value = this.valueToString(descriptor.value);
                    descriptor.parent = characteristic;
                }
            }
        }

        return prettyDatabase;
    }

    valueToString(value) {
        var valueString = '';

        for (var i = 0; i < value.length; i++) {
            var byteString = '0' + value[i].toString(16);
            valueString += byteString.slice(-2) + '-';
        }

        return valueString.slice(0,-1).toUpperCase();
    }
}

class Service {
    constructor(handle) {
        this.handle = handle;
        this.uuid = SERVICE_UUID;
        this.name = uuidDefinitions[SERVICE_UUID];
        this.characteristics = [];
        this.expanded = false;
    }
}

class Characteristic {
    constructor(handle) {
        this.handle = handle;
        this.uuid = CHARACTERISTIC_UUID;
        this.name = uuidDefinitions[CHARACTERISTIC_UUID];
        this.descriptors = [];
        this.expanded = false;
    }
}

class Descriptor {
    constructor(handle, uuid) {
        this.handle = handle;
        this.uuid = uuid;
        this.name = uuidDefinitions[uuid] || uuid;
        this.value = [];
        this.expanded = false;
    }
}

class Properties {
    constructor(properties) {
        this.broadcast = properties & 0x01;
        this.read = properties & 0x02;
        this.writeWithoutResponse = properties & 0x04;
        this.write = properties & 0x08;
        this.notify = properties & 0x10;
        this.indicate = properties & 0x20;
        this.authenticatedSignedWrites = properties & 0x40;
        this.extendedProperties = properties & 0x80;
    }

    getProperties() {
        var properties = [];

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
        name: "Health Thermometer",
        uuid: "0x1809",
        characteristics: [{
            handle: 2,
            valueHandle: 3,
            name: "Temperature",
            uuid: "0x2A1D",
            value: "37,5C" // must be manually read
        },
        {
            name: "Measurement Interval",
            uuid: "0x2A1D",
            value: "300 sec", // must be manually read
            descriptors: [{
                name: "Client Characteristic Configuration",
                uuid: "0x0028",
                value: "0x00" // must be manually read
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

        var connectionHandle = event.conn_handle;

        for (var i = 0; i < event.count; i++) {
            var discoveredAttribute = event.descs[i];
            var handle = discoveredAttribute.handle;

            var uuid = this.uuidIntToUuidString(discoveredAttribute.uuid.uuid, discoveredAttribute.uuid.type);

            if (uuid == SERVICE_UUID) {
                var gattDatabase = this.getGattDatabase(connectionHandle);
                var service = new Service(handle);
                this.insertGattObjectInList(gattDatabase.services, service);
            }
            else if (uuid == CHARACTERISTIC_UUID) {
                var parentService = this.findParentService(connectionHandle, handle);
                var characteristic = new Characteristic(handle);
                this.insertGattObjectInList(parentService.characteristics, characteristic);
            }
            else {
                var parentCharacteristic = this.findParentCharacteristic(connectionHandle, handle);
                var descriptor = new Descriptor(handle, uuid);
                this.insertGattObjectInList(parentCharacteristic.descriptors, descriptor);
            }
        }
    }

    onReadResponse(event) {
        if (event.gatt_status != bleDriver.BLE_GATT_STATUS_SUCCESS) {
            //TODO: Error handling, probably do nothing. Should it have gotten this far, if yes logging?
            return;
        }

        var connectionHandle = event.conn_handle;
        var handle = event.handle;
        var data = event.data.toJSON().data;
        var length = event.len;
        var readOffset = event.offset;

        var gattDatabase = this.getGattDatabase(connectionHandle);

        var attribute = this.findAttribute(gattDatabase, handle);

        if (attribute instanceof Service) {
            this.parseServiceData(attribute, data, length, readOffset);
        }
        else if (attribute instanceof Characteristic) {
            this.parseCharacteristicData(attribute, data, length, readOffset);
        }
        else if (attribute instanceof Descriptor) {
            this.parseDescriptorData(attribute, data, length, readOffset);
        }
        else {
            return false;
        }

        return true;
    }

    getHandleList(connectionHandle) {
        var handleList = [];
        var gattDatabase = this.getGattDatabase(connectionHandle);
        var services = gattDatabase.services;

        for (var serviceIndex = 0; serviceIndex < services.length; serviceIndex++) {
            var service = services[serviceIndex];
            var characteristics = service.characteristics;
            handleList.push(service.handle);

            for (var characteristicIndex = 0; characteristicIndex < characteristics.length; characteristicIndex++) {
                var characteristic = characteristics[characteristicIndex];
                var descriptors = characteristic.descriptors;
                handleList.push(characteristic.handle);

                for (var descriptorIndex = 0; descriptorIndex < descriptors.length; descriptorIndex++) {
                    var descriptor = descriptors[descriptorIndex];
                    handleList.push(descriptor.handle);
                }
            }
        }

        return handleList;
    }

    findParentService(connectionHandle, handle) {
        var gattDatabase = this.getGattDatabase(connectionHandle);
        var previousService;

        for (var i = 0; i < gattDatabase.services.length; i++) {
            var service = gattDatabase.services[i];
            var serviceHandle = service.handle;

            if (serviceHandle > handle) {
                break;
            }

            previousService = service;
        }

        return previousService;
    }

    findParentCharacteristic(connectionHandle, handle) {
        var parentService = this.findParentService(connectionHandle, handle);
        var previousCharacteristic;

        for (var i = 0; i < parentService.characteristics.length; i++) {
            var characteristic = parentService.characteristics[i];
            var characteristicHandle = characteristic.handle;

            if (characteristicHandle > handle) {
                break;
            }

            previousCharacteristic = characteristic;
        }

        return previousCharacteristic;
    }

    findAttribute(parent, handle) {
        var attributeList;

        if (parent instanceof GattDatabase) {
            attributeList = parent.services;
        }
        else if (parent instanceof Service) {
            attributeList = parent.characteristics;
        }
        else if (parent instanceof Characteristic) {
            attributeList = parent.descriptors;
        }
        else {
            return;
        }

        var previousAttribute;

        for (var i = 0; i < attributeList.length; i++) {
            var currentAttribute = attributeList[i];

            if (currentAttribute.handle === handle) {
                return currentAttribute;
            }
            else if (currentAttribute.handle > handle) {
                return this.findAttribute(previousAttribute, handle);
            }

            previousAttribute = currentAttribute;
        }

        return this.findAttribute(previousAttribute, handle);
    }

    parseServiceData(service, data, length, readOffset) {
        service.serviceUuid = this.arrayToString(data);
        service.name = uuidDefinitions[service.serviceUuid] || service.serviceUuid;
    }

    parseCharacteristicData(characteristic, data, length, readOffset) {
        characteristic.properties = new Properties(data[0]);
        characteristic.valueHandle = this.arrayToInt(data.slice(1, 3));
        characteristic.characteristicUuid = this.arrayToString(data.slice(3));
        characteristic.name = uuidDefinitions[characteristic.characteristicUuid] || characteristic.characteristicUuid;
    }

    parseDescriptorData(descriptor, data, length, readOffset) {
        var remainingData = descriptor.value.slice(0, readOffset);
        descriptor.value = remainingData.concat(data);
    }

    setCharacteristicValue(connectionHandle, valueHandle, value) {
        var parentCharacteristic = this.findParentCharacteristic(connectionHandle, valueHandle);

        if (parentCharacteristic.valueHandle != valueHandle) {
            return false;
        }

        parentCharacteristic.value = value;
        return true;
    }

    // TODO: Parse characteristic properties? Or are they pre parsed from driver

    // TODO: What is done with 128 bit uuids?
    uuidToName(uuid) {
        if (uuid in uuidDefinitions) {
            return uuidDefinitions[uuid];
        }

        return uuid;
    }

    uuidIntToUuidString(uuid, type) {
        var uuidString = uuid.toString(16).toUpperCase();

        uuidString = '000' + uuidString;
        uuidString =  uuidString.slice(-4);
        uuidString = '0x' + uuidString;

        if (type > bleDriver.BLE_UUID_TYPE_BLE) {
            uuidString += '*';
        }

        return uuidString;
    }

    arrayToString(array) {
        var string = '';

        for (var i = array.length - 1; i >= 0; i--) {
            var byteString = array[i].toString(16);
            byteString = ('0' + byteString).slice(-2);
            string += byteString;
        }

        string = '0x' + string.toUpperCase();

        return string;
    }

    arrayToInt(array) {
        var buffer = new Buffer(array);

        return buffer.readUInt16LE();
    }

    insertGattObjectInList(list, gattObject) {
        var gattObjectHandle = gattObject.handle;

        for (var i = 0; i < list.length; i++) {
            if (list[i].handle == gattObjectHandle) {
                list[i] = gattObject;
                return;
            }
        }

        list.push(gattObject);
    }

    getGattDatabase(connectionHandle) {
        for (var i = 0; i < this.gattDatabases.length; i++) {
            if (this.gattDatabases[i].connectionHandle == connectionHandle) {
                return this.gattDatabases[i];
            }
        }

        var gattDatabase = new GattDatabase(connectionHandle);

        this.gattDatabases.push(gattDatabase);

        return gattDatabase;
    }

    removeGattDatabase(connectionHandle) {
        var indexOfItemToDelete = this.gattDatabases.findIndex(function(gattDatabase) {
            return gattDatabase.connectionHandle === connectionHandle;
        });

        if(indexOfItemToDelete !== -1) {
            this.gattDatabases.splice(indexOfItemToDelete, 1);
        }

    }

    getPrettyGattDatabases() {
        var prettyDatabases = JSON.parse(JSON.stringify(this));
        var gattDatabases = prettyDatabases.gattDatabases;

        for (var gattDatabaseIndex = 0; gattDatabaseIndex < gattDatabases.length; gattDatabaseIndex++) {
            gattDatabases[gattDatabaseIndex] = gattDatabases.getPrettyGattDatabase();
        }

        return prettyDatabases;
    }
}

module.exports = {GattDatabases, Service, Characteristic, Descriptor, Properties};
