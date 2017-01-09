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
