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

export function findSelectedItem(deviceDetails, selectedInstanceId) {
    for (let item of traverseItems(deviceDetails, true)) {
        if (item.instanceId === selectedInstanceId) {
            return item;
        }
    }
}

export function* traverseItems(deviceDetails, skipCollapsed, backward) {
    if (!deviceDetails) {
        return;
    }

    const devices = deviceDetails.get('devices');

    if (devices === undefined) {
        return;
    }

    const [...deviceKeys] = backward ? devices.reverse().keys() : devices.keys();

    for (let i = 0; i < deviceKeys.length; i++) {
        const services = devices.getIn([deviceKeys[i], 'children']);

        if (services === undefined) {
            continue;
        }

        const [...servicesKeys] = backward ? services.reverse().keys() : services.keys();

        for (let j = 0; j < servicesKeys.length; j++) {
            const service = services.get(servicesKeys[j]);

            if (!backward) { yield service; }

            if (skipCollapsed && !service.expanded) {
                if (backward) { yield service; }
                continue;
            }

            const characteristics = services.get(servicesKeys[j]).children;

            if (characteristics === undefined) {
                continue;
            }

            const [...characteristicsKeys] = backward ? characteristics.reverse().keys() : characteristics.keys();

            for (let k = 0; k < characteristicsKeys.length; k++) {
                const characteristic = characteristics.get(characteristicsKeys[k]);

                if (!backward) { yield characteristic; }

                if (skipCollapsed && !characteristic.expanded) {
                    if (backward) { yield characteristic; }
                    continue;
                }

                const descriptors = characteristics.get(characteristicsKeys[k]).children;

                if (descriptors === undefined) {
                    continue;
                }

                const [...descriptorsKeys] = backward ? descriptors.reverse().keys() : descriptors.keys();

                for (let l = 0; l < descriptorsKeys.length; l++) {
                    yield descriptors.get(descriptorsKeys[l]);
                }

                if (backward) { yield characteristic; }
            }

            if (backward) { yield service; }
        }
    }
}
