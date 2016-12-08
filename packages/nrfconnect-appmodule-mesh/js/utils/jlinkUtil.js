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
    getJlinkRegistryPaths((err, paths) => {
        if (err) callback(err);

        regedit.list(paths)
        .on('error', error => callback(error))
        .on('data', entry => {
            const validSubEntries = entry.data.keys.filter(value => value.indexOf(jlinkId) >= 0);
            if (validSubEntries.length === 0) {
                return;
            }

            const path = validSubEntries.map(value => `${entry.key}\\${value}`);

            regedit.list(path)
            .on('error', error => callback(error))
            .on('data', entry => {
                if (!(entry.data.values && entry.data.values.ParentIdPrefix && entry.data.values.ParentIdPrefix.value)) {
                    return;
                }

                const parentIdPrefix = entry.data.values.ParentIdPrefix.value;

                getJlinkRegistryPaths((err, paths) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    regedit.list(paths)
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
    });
}

function portNameToJlinkId(portName, callback) {
    getJlinkRegistryPaths((err, paths) => {
        if (err) callback(err);

        regedit.list(paths)
        .on('error', error => callback(error))
        .on('data', entry => {
            const paths = entry.data.keys.map(value => `${entry.key}\\${value}\\Device Parameters`);
            regedit.list(paths)
            .on('error', error => callback(error))
            .on('data', entry => {
                if (!(entry.data.values && entry.data.values.PortName && entry.data.values.PortName.value)) {
                    return;
                }

                if (entry.data.values.PortName.value !== portName) {
                    return;
                }

                const match = entry.key.match(/\\([^\\]+)\\Device Parameters/);
                const parentIdPrefixMatch = match ? match[1] : null;

                getJlinkRegistryPaths((err, paths) => {
                    if (err) callback(err);

                    regedit.list(paths)
                    .on('error', error => callback(error))
                    .on('data', entry => {
                        const path = entry.data.keys.map(value => `${entry.key}\\${value}`);

                        regedit.list(path)
                        .on('error', error => callback(error))
                        .on('data', entry => {
                            if (!(entry.data.values && entry.data.values.ParentIdPrefix && entry.data.values.ParentIdPrefix.value)) {
                                return;
                            }

                            const parentIdPrefix = entry.data.values.ParentIdPrefix.value;

                            if (parentIdPrefixMatch.indexOf(parentIdPrefix) < 0) {
                                return;
                            }

                            const jlinkIdMatch = entry.key.match(/\\[0]*([1-9]+[0]*)$/);
                            const jlinkId = jlinkIdMatch[1];

                            if (jlinkId && callback) callback(null, jlinkId);
                        });
                    });
                });
            });
        });
    });
}

function getJlinkRegistryPaths(callback) {
    regedit.list('HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USB')
    .on('error', error => callback(error, null))
    .on('data', entry => {
        const jlinkEntries = entry.data.keys.filter(value => value.indexOf('VID_1366') === 0);
        const jlinkRegPaths = jlinkEntries.map(value => `${entry.key}\\${value}`);
        if (callback) {
            callback(null, jlinkRegPaths);
        }
    });
}

module.exports = { jlinkIdToPortName, portNameToJlinkId }
