'use strict';

export const SUCCESS = 'success';
export const ERROR = 'error';

export function validateUuid(uuid) {
    const uuid16regex = /^[0-9a-fA-F]{4}$/;
    const uuid128regex = /^[0-9a-fA-F]{32}$/;

    return uuid16regex.test(uuid) || uuid128regex.test(uuid) ? SUCCESS : ERROR;
}
