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
