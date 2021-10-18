/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { readFileSync, writeFile } from 'fs';
import path from 'path';
import { getUserDataDir, logger } from 'pc-nrfconnect-shared';

type Entries = {
    name: string;
    identifier: string;
    uuid: string;
    source: string;
}[];

const BLUETOOTH_NUMBERS_API_DISPLAY_URL = `https://github.com/NordicSemiconductor/bluetooth-numbers-database/tree/master/v1`;
const BLUETOOTH_NUMBERS_API_URL =
    'https://raw.githubusercontent.com/NordicSemiconductor/bluetooth-numbers-database/master/v1/';
const USER_DATA_DIR = getUserDataDir();
const UUID_FILENAMES = {
    services: 'service_uuids.json',
    characteristics: 'characteristic_uuids.json',
    descriptors: 'descriptor_uuids.json',
};

async function writeToFile(fileName: string, data: string) {
    const filePath = path.join(USER_DATA_DIR, fileName);
    const fileContent = JSON.stringify(data, null, 4);
    await writeFile(filePath, fileContent, err => {
        if (err) {
            logger.debug(`An error ocurred creating the file ${err.message}`);
        }
    });
}

function readFromFile(fileName: string): Entries {
    const filePath = path.join(USER_DATA_DIR, fileName);
    const uuidDefs = readFileSync(filePath);
    return JSON.parse(uuidDefs.toString());
}

async function getFromApi(fileName: string): Promise<Entries> {
    const url = BLUETOOTH_NUMBERS_API_URL + fileName;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Response code was ${response.status} when trying to access ${url} `
        );
    }
    const data = await response.json();
    await writeToFile(fileName, data);
    return data;
}

export const getAllUuids = async () => {
    const uuidKeys = Object.keys(
        UUID_FILENAMES
    ) as (keyof typeof UUID_FILENAMES)[];
    const responses = uuidKeys.map(key => getFromApi(UUID_FILENAMES[key]));

    try {
        const [services, characteristics, descriptors] = await Promise.all(
            responses
        );

        logger.info(
            `Updated list of uuids with data from ${BLUETOOTH_NUMBERS_API_DISPLAY_URL}`
        );

        return {
            services,
            characteristics,
            descriptors,
        };
    } catch (err) {
        logger.error(`${err}. Falling back to stored data`);
        try {
            const [services, characteristics, descriptors] = uuidKeys.map(key =>
                readFromFile(UUID_FILENAMES[key])
            );
            return {
                services,
                characteristics,
                descriptors,
            };
        } catch {
            return {
                services: {} as Entries,
                characteristics: {} as Entries,
                descriptors: {} as Entries,
            };
        }
    }
};
