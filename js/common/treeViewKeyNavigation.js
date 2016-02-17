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
