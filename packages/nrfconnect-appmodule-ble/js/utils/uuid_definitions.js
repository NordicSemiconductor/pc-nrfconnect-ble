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

import * as Definitions from './definitions';
import {remote} from 'electron';
import path from 'path';
import fs from 'fs';
import { logger } from '../logging';

export const TEXT = Definitions.TEXT;
export const NO_FORMAT = Definitions.NO_FORMAT;

let userDataDir = remote.getGlobal('userDataDir');
let uuidDefinitionsFilePath = path.join(userDataDir, 'uuid_definitions.json');
let RemoteDefinitions = require('./custom_definitions');

let customsFileErrorMessageShown = false;

confirmUserUUIDsExist();

function loadRemote()
{
    let data;

    try {
        data = fs.readFileSync(uuidDefinitionsFilePath, 'utf-8');
        RemoteDefinitions = JSON.parse(data);
    }
    catch (err) {
        RemoteDefinitions = require('./custom_definitions');

        if (!customsFileErrorMessageShown && data !== '') {
            customsFileErrorMessageShown = true;
            logger.info(`There was an error parsing the custom UUID definitions file: ${uuidDefinitionsFilePath}`);
            logger.debug(`UUID definitions file error: ${err}`);
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
        RemoteDefinitions.uuid16bitServiceDefinitions,
        RemoteDefinitions.uuid16bitCharacteristicDefinitions,
        RemoteDefinitions.uuid16bitDescriptorDefinitions);
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

function getLookupUUID(uuid) {
    let lookupUuid = uuid.toUpperCase();

    if (lookupUuid[1] === 'X') {
        lookupUuid = lookupUuid.slice(2);
    }

    return lookupUuid.replace(/-/g, '');
}

// TODO: look into using a database for storing the services UUID's. Also look into importing them from the Bluetooth pages.
// TODO: Also look into reusing code from the Android MCP project:
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/init
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/DatabaseHelper.java
export function getUuidName(uuid) {
    const lookupUuid = getLookupUUID(uuid);
    const uuidDefs = uuidDefinitions();

    if (uuidDefs[lookupUuid]) {
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

    const lookupUuid = getLookupUUID(uuid);

    const uuidDefs = uuidDefinitions();

    if (uuidDefs[lookupUuid]) {
        const format = uuidDefs[lookupUuid].format;

        if (format) {
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

    logger.info(`Application data folder: ${path.dirname(uuidDefinitionsFilePath)}`);
}

export function getUuidDefinitionsFilePath() {
    return uuidDefinitionsFilePath;
}
