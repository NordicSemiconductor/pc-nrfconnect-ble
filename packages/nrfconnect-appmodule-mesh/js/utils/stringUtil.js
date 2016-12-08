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
    } else if (typeof (value) === 'number') {
        return intToHexString(value);
    }

    return '';
}

function arrayToHexString(value) {
    const hexValueStringArray = value.map(intToHexString);
    return hexValueStringArray.join('');
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

export function hexArrayToText(value) {
    let str = '';

    for (let c in value) {
        str += String.fromCharCode(parseInt(value[c]));
    }

    return str;
}

export function textToHexArray(value) {
    let result = [];

    for (var i = 0, l = value.length; i < l; i++) {
        let hex = Number(value.charCodeAt(i)).toString(16);
        result.push(hex);
    }

    return result;
}

export function textToHexText(value) {
    return hexArrayToHexText(textToHexArray(value));
}

export function hexArrayToHexText(value) {
    let parsedValue = value;

    if (value.constructor === Array) {
        // Convert from array [1, 10, 16, 20] to hex string "01-0A-10-14"
        const hexValueStringArray = value.map(decimalNumber => ('0' + decimalNumber.toString(16)).slice(-2));
        parsedValue = hexValueStringArray.join(' ').toUpperCase();
    }

    return parsedValue;
}

export function parseHexString(str) {
    var result = [];
    while (str.length >= 8) {
        result.push(parseInt(str.substring(0, 8), 16));

        str = str.substring(8, str.length);
    }

    return result;
}

export function createHexString(arr) {
    var result = "";
    var z;

    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].toString(16);

        z = 8 - str.length + 1;
        str = Array(z).join("0") + str;

        result += str;
    }

    return result;
}
