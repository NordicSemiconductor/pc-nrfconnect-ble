/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

const MIN_RSSI = -100;
const MAX_RSSI = -45;

function mapRange(n, fromMin, fromMax, toMin, toMax) {
    //scale number n from the range [fromMin, fromMax] to [toMin, toMax]
    n = toMin + ((toMax - toMin) / (fromMax - fromMin)) * (n - fromMin);
    n = Math.round(n);
    return Math.max(toMin, Math.min(toMax, n));
}

export function prepareDeviceData(device) {
    return {
        name: device.name ? device.name : '<Unknown name>',
        flags: device.flags,
        services: device.services,
        address: device.address,
        rssi: device.rssi,
        rssi_level: mapRange(device.rssi, MIN_RSSI, MAX_RSSI, 4, 20),
    };
}
