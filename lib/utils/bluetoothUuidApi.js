/* Copyright (c) 2015 - 2020, Nordic Semiconductor ASA
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

import { logger, getUserDataDir } from 'nrfconnect/core';
import path from 'path';
import { readFileSync, writeFile } from 'fs';

const BLUETOOTH_NUMBERS_API_DISPLAY_URL = `https://github.com/NordicSemiconductor/bluetooth-numbers-database/tree/master/v1`;
const BLUETOOTH_NUMBERS_API_URL =
    'https://raw.githubusercontent.com/NordicSemiconductor/bluetooth-numbers-database/master/v1/';
const USER_DATA_DIR = getUserDataDir();
const UUID_FILENAMES = {
    services: 'service_uuids.json',
    characteristics: 'characteristic_uuids.json',
    descriptors: 'descriptor_uuids.json',
};

function writeToFile(fileName, data) {
    const filePath = path.join(USER_DATA_DIR, fileName);
    const fileContent = JSON.stringify(data, null, 4);
    writeFile(filePath, fileContent, err => {
        if (err) {
            logger.debug(`An error ocurred creating the file ${err.message}`);
        }
    });
}

function readFromFile(fileName) {
    const filePath = path.join(USER_DATA_DIR, fileName);
    const uuidDefs = readFileSync(filePath);
    return JSON.parse(uuidDefs);
}

function getFromApi(fileName) {
    const url = BLUETOOTH_NUMBERS_API_URL + fileName;
    return fetch(url)
        .then(response => {
            if (response.status !== 200) {
                throw new Error(
                    `Response code was ${response.status} when trying to access ${url} `
                );
            }
            return response.json();
        })
        .then(data => {
            writeToFile(fileName, data);
            return data;
        })
        .catch(err => {
            throw err;
        });
}

export default () => {
    const uuidKeys = Object.keys(UUID_FILENAMES);
    const responses = uuidKeys.map(key => getFromApi(UUID_FILENAMES[key]));
    return Promise.all(responses)
        .then(([services, characteristics, descriptors]) => {
            logger.info(
                `Updated list of uuids with data from ${BLUETOOTH_NUMBERS_API_DISPLAY_URL}`
            );
            return {
                services,
                characteristics,
                descriptors,
            };
        })
        .catch(err => {
            logger.error(`${err}. Falling back to stored data`);
            try {
                const [
                    services,
                    characteristics,
                    descriptors,
                ] = uuidKeys.map(key => readFromFile(UUID_FILENAMES[key]));
                return {
                    services,
                    characteristics,
                    descriptors,
                };
            } catch (error) {
                return {};
            }
        });
};
