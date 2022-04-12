/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* These exports exist to indicate formating of the content in a characteristic.
 * Example:
 *    '2A00': { name: 'Device Name', format: TEXT },
 *    will format the data in the characteristic with UUID 2A00 as text.
 *
 * The default is NO_FORMAT which will present the data raw.
 */
export const TEXT = 'TEXT';
export const NO_FORMAT = 'NO_FORMAT';

export const GENERIC_ACCESS_UUID = '1800';
export const DEVICE_NAME_UUID = '2A00';
export const SECURE_DFU_UUID = 'FE59';

/* eslint quote-props: ["error", "as-needed", { "numbers": true, "unnecessary": false }] */

export const uuid16bitCharacteristicDefinitions = {
    [DEVICE_NAME_UUID]: { format: TEXT },
    '2A24': { name: 'Model Number String', format: TEXT },
    '2A25': { name: 'Serial Number String', format: TEXT },
    '2A26': { name: 'Firmware Revision String', format: TEXT },
    '2A27': { name: 'Hardware Revision String', format: TEXT },
    '2A28': { name: 'Software Revision String', format: TEXT },
    '2A29': { name: 'Manufacturer Name String', format: TEXT },
    '2A87': { name: 'Email Address', format: TEXT },
    '2A8A': { name: 'First Name', format: TEXT },
    '2A90': { name: 'Last Name', format: TEXT },
    '2AB5': { name: 'Location Name', format: TEXT },
};

export const uuid128bitCharacteristicDefinitions = {
    // thingy configuration service UUIDs:
    'EF6801019B3549339B1052FFA9740042': { name: 'Device Name', format: TEXT },
    'EF6801069B3549339B1052FFA9740042': { name: 'Cloud Token', format: TEXT },
    // Nordic UART service:
    '6E400002B5A3F393E0A9E50E24DCCA9E': { name: 'UART RX Characteristic', format: TEXT },
    '6E400003B5A3F393E0A9E50E24DCCA9E': { name: 'UART TX Characteristic', format: TEXT },
};
