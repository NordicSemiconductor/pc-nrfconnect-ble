/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

var less = require('less');
var fs = require('fs');

module.exports = function compileLess(sourceFile, targetFile, callback) {
    fs.readFile(sourceFile, function (err1, data) {
        if (err1) {
            return callback(err1);
        }

        less.render(data.toString(), function (err2, output) {
            if (err2) {
                return callback(err2);
            }

            fs.writeFile(targetFile, output.css, function (err3) {
                return callback(err3);
            });
        });
    });
};
