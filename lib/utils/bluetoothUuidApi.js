import { logger } from 'nrfconnect/core';

const BLUETOOTH_NUMBERS_API_DISPLAY_URL = `https://github.com/NordicSemiconductor/bluetooth-numbers-database/tree/master/v1`;
const BLUETOOTH_NUMBERS_API_URL =
    'https://raw.githubusercontent.com/NordicSemiconductor/bluetooth-numbers-database/master/v1/';

export default () => {
    const services = getFromApi('service_uuids.json');
    const chars = getFromApi('characteristic_uuids.json');
    const descriptors = getFromApi('descriptor_uuids.json');
    return Promise.all([services, chars, descriptors])
        .then(data => {
            logger.info(
                `Updated list of uuids with data from ${BLUETOOTH_NUMBERS_API_DISPLAY_URL}`
            );
            return {
                services: data[0],
                characteristics: data[1],
                descriptors: data[2],
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
        .catch(err => {
            throw new Error(err);
        });
}
