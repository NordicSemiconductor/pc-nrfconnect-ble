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
