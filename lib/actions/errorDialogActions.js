/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

export const ERROR_DIALOG_SHOW = 'ERROR_DIALOG_SHOW';

export function showErrorDialog(error = 'Undefined error') {
    return {
        type: ERROR_DIALOG_SHOW,
        message: error.message || error,
    };
}
