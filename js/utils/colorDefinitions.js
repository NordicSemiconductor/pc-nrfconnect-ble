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

import remote from 'remote';
import { logger } from '../logging';

var colors;

function hexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

export function getColor(color) {
    if (!colors) {
        colors = remote.getGlobal('colors');

        if (!colors) {
            logger.debug('Failed loading colors');
            return hexToRGB('#FF0000');
        }
    }

    const colorObject = colors[color];
    if (!colorObject) {
        logger.debug('Color ' + color + ' is not defined');
        return hexToRGB('#FF0000');
    }

    return hexToRGB(colorObject);
}
