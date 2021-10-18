/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

function intToHexString(value: number) {
    return `0${value.toString(16)}`.slice(-2).toUpperCase();
}

function arrayToHexString(value: number[]) {
    const hexValueStringArray = value.map(intToHexString);
    return hexValueStringArray.join('-');
}

export function toHexString(value: number[] | number) {
    if (Array.isArray(value)) {
        return arrayToHexString(value);
    }

    if (typeof value === 'number') {
        return intToHexString(value);
    }

    return '';
}

export function hexStringToArray(oldHexString: string) {
    let hexString = oldHexString;
    const result = [];
    while (hexString.length >= 2) {
        const element = parseInt(hexString.substring(0, 2), 16);
        result.push(element);
        hexString = hexString.substring(2, hexString.length);
    }

    return result;
}

export function hexArrayToText(value: string[]) {
    const inputBytes: number[] = [];
    value.forEach(c => {
        inputBytes.push(parseInt(c, 10));
    });

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(new Uint8Array(inputBytes));
}

export function textToHexArray(value: string) {
    const encoder = new TextEncoder();
    const outputBytes = encoder.encode(value);
    return [...outputBytes];
}

export function hexArrayToHexText(value: number[]) {
    if (value.constructor === Array) {
        // Convert from array [1, 10, 16, 20] to hex string "01-0A-10-14"
        const hexValueStringArray = value.map(decimalNumber =>
            `0${decimalNumber.toString(16)}`.slice(-2)
        );
        return hexValueStringArray.join(' ').toUpperCase();
    }
    return value;
}

export function textToHexText(value: string) {
    return hexArrayToHexText(textToHexArray(value));
}
