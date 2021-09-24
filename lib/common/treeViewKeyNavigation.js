/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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

    const [...deviceKeys] = backward
        ? devices.reverse().keys()
        : devices.keys();

    for (let i = 0; i < deviceKeys.length; i += 1) {
        const services = devices.getIn([deviceKeys[i], 'children']);

        if (services !== undefined) {
            const [...servicesKeys] = backward
                ? services.reverse().keys()
                : services.keys();

            for (let j = 0; j < servicesKeys.length; j += 1) {
                const service = services.get(servicesKeys[j]);

                if (!backward) {
                    yield service;
                }

                if (skipCollapsed && !service.expanded) {
                    if (backward) {
                        yield service;
                    }
                } else {
                    const characteristics = services.get(
                        servicesKeys[j]
                    ).children;

                    if (characteristics !== undefined) {
                        const [...characteristicsKeys] = backward
                            ? characteristics.reverse().keys()
                            : characteristics.keys();

                        for (
                            let k = 0;
                            k < characteristicsKeys.length;
                            k += 1
                        ) {
                            const characteristic = characteristics.get(
                                characteristicsKeys[k]
                            );

                            if (!backward) {
                                yield characteristic;
                            }

                            if (skipCollapsed && !characteristic.expanded) {
                                if (backward) {
                                    yield characteristic;
                                }
                            } else {
                                const descriptors = characteristics.get(
                                    characteristicsKeys[k]
                                ).children;

                                if (descriptors !== undefined) {
                                    const [...descriptorsKeys] = backward
                                        ? descriptors.reverse().keys()
                                        : descriptors.keys();

                                    for (
                                        let l = 0;
                                        l < descriptorsKeys.length;
                                        l += 1
                                    ) {
                                        yield descriptors.get(
                                            descriptorsKeys[l]
                                        );
                                    }

                                    if (backward) {
                                        yield characteristic;
                                    }
                                }
                            }
                        }

                        if (backward) {
                            yield service;
                        }
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
