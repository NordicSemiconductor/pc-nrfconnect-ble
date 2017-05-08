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

import semver from 'semver';
import { logger } from 'nrfconnect/core';
import programming from 'nrfconnect/programming';
import bleDriver from 'nrfconnect/pc-ble-driver-js';

const latestFirmwareVersion = '1.1.0';

function checkVersion(version) {
    if (!version) {
        return false;
    }

    // Require higher than or equal to version, but disallow increment in major version number
    const versionRule = `^${latestFirmwareVersion}`;
    if (!semver.satisfies(version, versionRule)) {
        return false;
    }

    return true;
}

function checkVersionInfo(serialNumber, { onValid, onInvalid }) {
    programming.getVersionInfo(serialNumber)
    .then(version => {
        const versionString = version ? semver.clean(version.string) : null;
        if (!checkVersion(versionString)) {
            onInvalid();
        } else {
            logger.info(`Connectivity firmware version ${versionString} detected`);
            logger.debug(`Connectivity firmware info: sdBleApiVersion: ${version.sdBleApiVersion}, baudRate: ${version.baudRate}, transportType: ${version.transportType}`);
            onValid(version);
        }
    })
    .catch(err => {
        logger.error(`Error when validating firmware: ${err.message}`);
        onInvalid();
    });
}

export function validateFirmware(serialNumber, { onValid, onInvalid }) {
    return () => {
        checkVersionInfo(serialNumber, { onValid, onInvalid });
    };
}

export function programFirmware(serialNumber, { onSuccess, onFailure }) {
    return () => {
        const files = {
            nrf51: bleDriver.getFirmwarePath('nrf51'),
            nrf52: bleDriver.getFirmwarePath('nrf52'),
            isRelativeToApp: false,
        };
        programming.programWithHexFile(serialNumber, files)
        .then(() => {
            checkVersionInfo(serialNumber, {
                onValid: onSuccess,
                onInvalid: () => {
                    logger.error('Connectivity firmware version check failed');
                    onFailure();
                },
            });
        })
        .catch(err => logger.error(`Error when programming: ${err.message}`));
    };
}
