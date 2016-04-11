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

export const BLUE = 'blue';
export const SOFT_BLUE = 'soft_blue';
export const WHITE = 'white';

const colors = {
    blue: { r: 179, g: 225, b: 245 },
    soft_blue: { r: 215, g:235, b: 244 },
    white: { r: 255, g: 255, b: 255 },
};

export function getColor(color) {
    const colorObject = colors[color];
    if (!colorObject) {
        return;
    }

    return Object.assign({}, colorObject);
}
