"use strict";

/*
 *  We assume that parent is always found before its children.
 */

//import logger from './logging';
import bleDriver from 'pc-ble-driver-js';
import uuidDefinitions from './utils/uuid_definitions';

//in event:
var gattDescDiscEvent = {
    "id":51,
    "name":"BLE_GATTC_EVT_DESC_DISC_RSP",
    "time":"2015-08-28T11:12:48.802Z",
    "conn_handle":0,
    "gatt_status":0,
    "error_handle":0,
    "count":1,
    "descs":[{
        "handle":1,
        "uuid":{
            "uuid":10240,
            "type":1,
            "typeString":"BLE_UUID_TYPE_BLE"
        }
    }],
    "level":"debug",
    "message":"BLE_GATTC_EVT_DESC_DISC_RSP",
    "timestamp":"2015-08-28T11:12:48.936Z"
};

const SERVICE_UUID = "0x2800";
const CHARACTERISTIC_UUID = "0x2803";

class AttributeDatabase {
    constructor(connectionHandle) {
        this.connectionHandle = connectionHandle;
        this.services = [];
    }
}

class Service {
    constructor(handle) {
        this.handle = handle;
        this.uuid = SERVICE_UUID;
        this.name = uuidDefinitions[SERVICE_UUID];
        this.characteristics = [];
    }
}

class Characteristic {
    constructor(handle) {
        this.handle = handle;
        this.uuid = CHARACTERISTIC_UUID;
        this.name = uuidDefinitions[CHARACTERISTIC_UUID];
        this.descriptors = [];
    }
}

class Descriptor {
    constructor(handle, uuid) {
        this.handle = handle;
        this.uuid = uuid;
        this.name = uuidDefinitions[uuid];
        this.data = [];
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
}

class GattDatabases {

    constructor() {
        // TODO: Keep a example database structure?
        this.attributeDatabase = [];
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

        if (parent instanceof AttributeDatabase) {
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

            if (currentAttribute.handle == handle) {
                return currentAttribute;
            }
            else if (currentAttribute.handle > handle) {
                return this.findAttribute(previousAttribute, handle);
            }

            previousAttribute = currentAttribute;
        }
    }

    parseServiceData(service, data, length, readOffset) {
        service.serviceUuid = this.arrayToString(data);
        service.name = uuidDefinitions[service.serviceUuid];
    }

    parseCharacteristicData(characteristic, data, length, readOffset) {
        characteristic.properties = new Properties(data[0]);
        characteristic.valueHandle = this.arrayToInt(data.slice(1, 3));
        characteristic.characteristicUuid = this.arrayToString(data.slice(3));
        characteristic.name = uuidDefinitions[characteristic.characteristicUuid];
    }

    parseDescriptorData(descriptor, data, length, readOffset) {
        var remainingData = descriptor.data.slice(0, readOffset);
        descriptor.data = remainingData.concat(data);
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
        for (var i = 0; i < this.attributeDatabase.length; i++) {
            if (this.attributeDatabase[i].connectionHandle == connectionHandle) {
                return this.attributeDatabase[i];
            }
        }

        var gattDatabase = new AttributeDatabase(connectionHandle);

        this.attributeDatabase.push(gattDatabase);

        return gattDatabase;
    }

    removeGattDatabase(connectionHandle) {
        delete this.attributeDatabase[connectionHandle];
    }
}

module.exports = GattDatabases;
