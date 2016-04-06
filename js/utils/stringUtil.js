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

export function toHexString(value) {
    if (Array.isArray(value)) {
        return arrayToHexString(value);
    } else if (typeof(value) === 'number') {
        return intToHexString(value);
    }

    return '';
}

function arrayToHexString(value) {
    const hexValueStringArray = value.map(intToHexString);
    return hexValueStringArray.join('-');
}

function intToHexString(value) {
    return ('0' + value.toString(16)).slice(-2).toUpperCase();
}

export function hexStringToArray(hexString) {
    let result = [];
    while (hexString.length >= 2) {
        const element = parseInt(hexString.substring(0, 2), 16);
        result.push(element);
        hexString = hexString.substring(2, hexString.length);
    }

    return result;
}
