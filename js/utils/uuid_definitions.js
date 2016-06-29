/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

import * as Definitions from './definitions';
import * as remote from 'remote';
import path from 'path';
import fs from 'fs';
import { logger } from '../logging';

export const TEXT = Definitions.TEXT;
export const NO_FORMAT = Definitions.NO_FORMAT;

let dataFileDir = remote.getGlobal('dataFileDir');
let uuidDefinitionsFilePath = path.join(dataFileDir, 'uuid_definitions.json');
var RemoteDefinitions = require('./custom_definitions');

var customsFileErrorMessageShown = false;

confirmUserUUIDsExist();

function loadRemote()
{
    var data = fs.readFileSync(uuidDefinitionsFilePath, 'utf-8');

    try {
        RemoteDefinitions = JSON.parse(data);
    }
    catch (err) {
        RemoteDefinitions = require('./custom_definitions');

        if (!customsFileErrorMessageShown) {
            customsFileErrorMessageShown = true;
            logger.info(`There is an error with the custom UUID definitions file: ${uuidDefinitionsFilePath}`);
        }
    }
}

export function uuid16bitServiceDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid16bitServiceDefinitions,
        RemoteDefinitions.uuid16bitServiceDefinitions
    );
}

export function uuid128bitServiceDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid128bitServiceDefinitions,
        RemoteDefinitions.uuid128bitServiceDefinitions
    );
}

export function uuid128bitDescriptorDefinitions() {
    loadRemote();

    return Object.assign({},
        RemoteDefinitions.uuid128bitDescriptorDefinitions);
}

export function uuidServiceDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid16bitServiceDefinitions,
        Definitions.uuid128bitServiceDefinitions,
        RemoteDefinitions.uuid16bitServiceDefinitions,
        RemoteDefinitions.uuid128bitServiceDefinitions);
}

export function uuidCharacteristicDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid16bitCharacteristicDefinitions,
        Definitions.uuid128bitCharacteristicDefinitions,
        RemoteDefinitions.uuid16bitCharacteristicDefinitions,
        RemoteDefinitions.uuid128bitCharacteristicDefinitions);
}

export function uuidDescriptorDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid16bitDescriptorDefinitions,
        RemoteDefinitions.uuid16bitDescriptorDefinitions,
        uuid128bitDescriptorDefinitions());
}

export function uuid16bitDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid16bitServiceDefinitions,
        Definitions.uuid16bitCharacteristicDefinitions,
        Definitions.uuid16bitDescriptorDefinitions,
        Definitions.uuid16bitGattDefinitions,
        RemoteDefinitions.uuid16bitServiceDefinitions,
        RemoteDefinitions.uuid16bitCharacteristicDefinitions,
        RemoteDefinitions.uuid16bitDescriptorDefinitions,
        RemoteDefinitions.uuid16bitGattDefinitions);
}

export function uuid128bitDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid128bitServiceDefinitions,
        Definitions.uuid128bitCharacteristicDefinitions,
        RemoteDefinitions.uuid128bitServiceDefinitions,
        RemoteDefinitions.uuid128bitCharacteristicDefinitions,
        uuid128bitDescriptorDefinitions());
}

export function uuidDefinitions() {
    loadRemote();

    return Object.assign({},
        uuid16bitDefinitions(),
        uuid128bitDefinitions());
}

// TODO: look into using a database for storing the services UUID's. Also look into importing them from the Bluetooth pages.
// TODO: Also look into reusing code from the Android MCP project:
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/init
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/DatabaseHelper.java
export function getUuidName(uuid) {
    let lookupUuid = uuid.toUpperCase();
    if (lookupUuid[1] === 'X') {
        lookupUuid = lookupUuid.slice(2);
    }

    const uuidDefs = uuidDefinitions();

    if (uuidDefs[lookupUuid])
    {
        return uuidDefs[lookupUuid].name;
    }

    return uuid;
}

export function getUuidByName(name) {
    const uuidDefs = uuidDefinitions();

    for (let uuid in uuidDefs) {
        if (uuidDefs.hasOwnProperty(uuid)) {
            if (uuidDefs[uuid].name === name) {
                return uuid;
            }
        }
    }
}

export function getPrettyUuid(uuid) {
    const insertHyphen = (string, index) => {
        return string.substr(0, index) + '-' + string.substr(index);
    };

    if (uuid.length === 4) {
        return uuid.toUpperCase();
    }

    uuid = insertHyphen(uuid, 20);
    uuid = insertHyphen(uuid, 16);
    uuid = insertHyphen(uuid, 12);
    uuid = insertHyphen(uuid, 8);

    return uuid.toUpperCase();
}

export function getUuidFormat(uuid) {
    if (!uuid) {
        return Definitions.NO_FORMAT;
    }

    let lookupUuid = uuid.toUpperCase();

    if (lookupUuid[1] === 'X') {
        lookupUuid = lookupUuid.slice(2);
    }

    const uuidDefs = uuidDefinitions();

    if (uuidDefs[lookupUuid])
    {
        const format = uuidDefs[lookupUuid].format;

        if (format)
        {
            return format.toUpperCase();
        }

        return Definitions.NO_FORMAT;
    }

    return Definitions.NO_FORMAT;
}

function confirmUserUUIDsExist() {
    if (!fs.existsSync(uuidDefinitionsFilePath)) {
        var uuid_definitions = require('./custom_definitions');

        fs.writeFile(uuidDefinitionsFilePath, JSON.stringify(uuid_definitions, null, 4), function (err) {
            if (err) {
                logger.debug('An error ocurred creating the file ' + err.message);
                return;
            }
        });
    }

    logger.info(`Custom UUID definitions: ${uuidDefinitionsFilePath}`);
}
