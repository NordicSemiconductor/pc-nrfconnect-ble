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

'use strict';

export function* traverseItems(deviceDetails, skipCollapsed, backward) {
    if (!deviceDetails) {
        return;
    }

    const devices = deviceDetails.get('devices');

    if (devices === undefined) {
        return;
    }

    const [...deviceKeys] = backward ? devices.reverse().keys() : devices.keys();

    for (let i = 0; i < deviceKeys.length; i += 1) {
        const services = devices.getIn([deviceKeys[i], 'children']);

        if (services !== undefined) {
            const [...servicesKeys] = backward ? services.reverse().keys() : services.keys();

            for (let j = 0; j < servicesKeys.length; j += 1) {
                const service = services.get(servicesKeys[j]);

                if (!backward) { yield service; }

                if (skipCollapsed && !service.expanded) {
                    if (backward) { yield service; }
                } else {
                    const characteristics = services.get(servicesKeys[j]).children;

                    if (characteristics !== undefined) {
                        const [...characteristicsKeys] = backward
                            ? characteristics.reverse().keys()
                            : characteristics.keys();

                        for (let k = 0; k < characteristicsKeys.length; k += 1) {
                            const characteristic = characteristics.get(characteristicsKeys[k]);

                            if (!backward) { yield characteristic; }

                            if (skipCollapsed && !characteristic.expanded) {
                                if (backward) { yield characteristic; }
                            } else {
                                const descriptors =
                                    characteristics.get(characteristicsKeys[k]).children;

                                if (descriptors !== undefined) {
                                    const [...descriptorsKeys] = backward
                                        ? descriptors.reverse().keys()
                                        : descriptors.keys();

                                    for (let l = 0; l < descriptorsKeys.length; l += 1) {
                                        yield descriptors.get(descriptorsKeys[l]);
                                    }

                                    if (backward) { yield characteristic; }
                                }
                            }
                        }

                        if (backward) { yield service; }
                    }
                }
            }
        }
    }
}

export function findSelectedItem(deviceDetails, selectedInstanceId) {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of traverseItems(deviceDetails, true)) {
        if (item.instanceId === selectedInstanceId) {
            return item;
        }
    }
    return undefined;
}
