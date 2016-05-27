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

var regedit = require('regedit');

// callback signature  (err, portName)
function jlinkIdToPortName(jlinkId, callback) {
    let validEntryPathsCopy;

    regedit.list('HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USB')
    .on('error', error => callback(error))
    .on('data', entry => {
        const validEntries = entry.data.keys.filter(value => value.indexOf('VID_1366') === 0);

        const validEntryPaths = validEntries.map(value => `${entry.key}\\${value}`);

        // Storing the array for later use since list operation will mutate the array
        validEntryPathsCopy = validEntryPaths.slice();

        regedit.list(validEntryPaths)
        .on('error', error => callback(error))
        .on('data', entry => {
            const validSubEntries = entry.data.keys.filter(value => value.indexOf(jlinkId) >= 0);
            if (validSubEntries.length === 0) {
                return;
            }

            const pathToPortName = validSubEntries.map(value => `${entry.key}\\${value}`);

            regedit.list(pathToPortName)
            .on('error', error => callback(error))
            .on('data', entry => {
                if (!(entry.data.values && entry.data.values.ParentIdPrefix && entry.data.values.ParentIdPrefix.value)) {
                    return;
                }

                const parentIdPrefix = entry.data.values.ParentIdPrefix.value;

                regedit.list(validEntryPathsCopy)
                .on('error', error => callback(error))
                .on('data', entry => {
                    const validEntries = entry.data.keys.filter(value => value.indexOf(parentIdPrefix) === 0);
                    if (validEntries.length === 0) {
                        return;
                    }

                    const validSubEntryPaths = validEntries.map(value => `${entry.key}\\${value}\\Device Parameters`);

                    regedit.list(validSubEntryPaths)
                    .on('error', error => callback(error))
                    .on('data', entry => {

                        if (!(entry.data.values && entry.data.values.PortName && entry.data.values.PortName.value)) {
                            return;
                        }

                        const portName = entry.data.values.PortName.value;
                        if (callback) {callback(null, portName);}
                    });
                });
            });
        });
    });
}

module.exports = { jlinkIdToPortName }
