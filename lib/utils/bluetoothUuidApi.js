import { logger, getUserDataDir } from 'nrfconnect/core';
import path from 'path';
import { writeFile } from 'fs';

const BLUETOOTH_NUMBERS_API_DISPLAY_URL = `https://github.com/NordicSemiconductor/bluetooth-numbers-database/tree/master/v1`;
const BLUETOOTH_NUMBERS_API_URL =
    'https://raw.githubusercontent.com/NordicSemiconductor/bluetooth-numbers-database/master/v1/';
const USER_DATA_DIR = getUserDataDir();

export default () => {
    const services = getFromApi('service_uuids.json');
    const chars = getFromApi('characteristic_uuids.json');
    const descriptors = getFromApi('descriptor_uuids.json');
    return Promise.all([services, chars, descriptors])
        .then(data => {
            logger.info(
                `Updated list of uuids with data from ${BLUETOOTH_NUMBERS_API_DISPLAY_URL}`
            );
            data.forEach(uuidList =>
                writeToFile(uuidList.fileName, uuidList.uuids)
            );
            return {
                services: data[0].uuids,
                characteristics: data[1].uuids,
                descriptors: data[2].uuids,
            };
        })
        .catch(err => {
            logger.error(`Error: ${err}. Falling back to stored data`);
            return null;
        });
};

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
        .then(uuids => ({
            uuids,
            fileName,
        }))
        .catch(err => {
            throw new Error(err);
        });
}

function writeToFile(fileName, data) {
    const filePath = path.join(USER_DATA_DIR, fileName);
    const fileContent = JSON.stringify(data, null, 4);
    writeFile(filePath, fileContent, err => {
        if (err) {
            logger.debug(`An error ocurred creating the file ${err.message}`);
        }
    });
}
