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

var less = require('less');
import * as fs from 'fs';

export const BLUE = 'blue';
export const SOFT_BLUE = 'soft_blue';
export const WHITE = 'white';

var colors = null;

export function getColor(color) {
    return new Promise((resolve, reject) => {
        if (colors === null) {
            resolve();
            return;
        }

        reject();
    }).this(() => {
        const data = fs.readFileSync('css/colordefinitions.less');
        console.log('About to parse');

        less.render(data.toString(), (error, root) => {
            console.log(root);

            if (error) {
                return;
            }

            colors = root.css;
            return root.css;
        });
    }).catch(() => {}).then(() => {
        console.log('COLORS: ' + JSON.stringify(colors));
        const colorObject = colors[color];
        if (!colorObject) {
            console.log('Failed');
            return;
        }

        console.log('Success');
        return Object.assign({}, colorObject);
    });
}
