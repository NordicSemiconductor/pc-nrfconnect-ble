/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

function ValidationError(msg) {
    const err = Error.call(this, msg);
    err.name = 'ValidationError';
    return err;
}

ValidationError.prototype = Object.create(Error.prototype, {
    constructor: { value: ValidationError },
});

module.exports = { ValidationError };
