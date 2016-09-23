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


function ValidationError(msg) {
    var err = Error.call(this, msg);
    err.name = "ValidationError";
    return err;
}

ValidationError.prototype = Object.create(Error.prototype, {
    constructor: { value: ValidationError }
});


module.exports = { ValidationError };
