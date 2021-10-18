/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

export const SUCCESS = 'success';
export const ERROR = 'error';

export function validateUuid(uuid: string) {
    const uuid16regex = /^[0-9a-fA-F]{4}$/;
    const uuid128regex = /^[0-9a-fA-F]{32}$/;

    return uuid16regex.test(uuid) || uuid128regex.test(uuid) ? SUCCESS : ERROR;
}
