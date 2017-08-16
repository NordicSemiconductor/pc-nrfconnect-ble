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

import path from 'path';
import fs from 'fs';
import { logger } from 'nrfconnect/core';

import * as Definitions from './definitions';

export const TEXT = Definitions.TEXT;
export const NO_FORMAT = Definitions.NO_FORMAT;

let uuidDefinitionsFilePath;
let uuidDefinitionsFileMTime = 0;
const customDefinitions = require('./custom_definitions.json');

let RemoteDefinitions = { ...customDefinitions };

let customsFileErrorMessageShown = false;

export function confirmUserUUIDsExist(userDataDir) {
    uuidDefinitionsFilePath = path.join(userDataDir, 'uuid_definitions.json');

    if (!fs.existsSync(uuidDefinitionsFilePath)) {
        fs.writeFile(uuidDefinitionsFilePath, JSON.stringify(customDefinitions, null, 4), err => {
            if (err) {
                logger.debug(`An error ocurred creating the file ${err.message}`);
            }
        });
    }
}

function loadRemote() {
    let data;

    try {
        const { mtime } = fs.statSync(uuidDefinitionsFilePath);
        const msec = mtime.getTime();
        if (uuidDefinitionsFileMTime < msec) {
            uuidDefinitionsFileMTime = msec;
            data = fs.readFileSync(uuidDefinitionsFilePath, 'utf-8');
            RemoteDefinitions = JSON.parse(data);
        }
    } catch (err) {
        RemoteDefinitions = { ...customDefinitions };

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
        RemoteDefinitions.uuid16bitServiceDefinitions,
    );
}

export function uuid128bitServiceDefinitions() {
    loadRemote();

    return Object.assign({},
        Definitions.uuid128bitServiceDefinitions,
        RemoteDefinitions.uuid128bitServiceDefinitions,
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

// TODO: look into using a database for storing the services UUID's.
// TODO:   Also look into importing them from the Bluetooth pages.
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

export function getPrettyUuid(uuid) {
    if (uuid.length === 4) {
        return uuid.toUpperCase();
    }

    const insertHyphen = (string, index) => (
        `${string.substr(0, index)}-${string.substr(index)}`
    );

    return insertHyphen(insertHyphen(insertHyphen(insertHyphen(
        uuid.toUpperCase(), 20), 16), 12), 8);
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

export function getUuidDefinitionsFilePath() {
    return uuidDefinitionsFilePath;
}
