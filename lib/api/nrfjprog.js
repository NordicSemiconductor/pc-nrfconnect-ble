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

import nrfjprog from 'pc-nrfjprog-js';

function open(serialNumber) {
    return new Promise((resolve, reject) => {
        nrfjprog.open(serialNumber, err => {
            if (err) {
                reject(new Error(`Failed to open nrfjprog: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
}

function close(serialNumber) {
    return new Promise((resolve, reject) => {
        nrfjprog.close(serialNumber, err => {
            if (err) {
                reject(new Error(`Failed to close nrfjprog: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
}

function getDeviceInfo(serialNumber) {
    return new Promise((resolve, reject) => {
        nrfjprog.getDeviceInfo(serialNumber, (err, deviceInfo) => {
            if (err) {
                reject(new Error(`Failed to get device info: ${err.message}`));
            } else {
                resolve(deviceInfo);
            }
        });
    });
}

function getProbeInfo(serialNumber) {
    return new Promise((resolve, reject) => {
        nrfjprog.getProbeInfo(serialNumber, (err, probeInfo) => {
            if (err) {
                reject(new Error(`Failed to get probe info: ${err.message}`));
            } else {
                resolve(probeInfo);
            }
        });
    });
}

// eslint-disable-next-line import/prefer-default-export
export function getAllDeviceInfo(serialNumber) {
    // By default, the nrfjprog function calls implicitly open a connection,
    // perform an operation, reset the device and close the connection to
    // the device. We are calling nrfjprog multiple times here, so we wrap
    // the function calls in open/close so that open, reset, and close are
    // only done once.
    const allInfo = {};
    return open(serialNumber)
        .then(() => getDeviceInfo(serialNumber))
        .then(deviceInfo => {
            allInfo.deviceInfo = deviceInfo;
            return getProbeInfo(serialNumber);
        })
        .then(probeInfo => {
            allInfo.probeInfo = probeInfo;
            return close(serialNumber);
        })
        .then(() => allInfo);
}
