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

import fs from 'fs';
import os from 'os';
import {shell} from 'electron';
import childProcess from 'child_process';

export function openFileInDefaultApplication(filePath, callback) {
    fs.exists(filePath, exists => {
        if (!exists) {
            if (callback) {
                callback(new Error(`Could not find file at path: ${filePath}`));
            }

            return;
        }

        const escapedPath = filePath.replace(/ /g, '\\ ');

        // Could not find a method that works on all three platforms:
        // * shell.openItem works on Windows and Linux but not on OSX
        // * childProcess.execSync works on OSX but not on Windows
        if (os.type() === 'Darwin') {
            childProcess.execSync(`open  ${escapedPath}`);
        } else {
            console.log(`want to open ${escapedPath}`)
            const ret = shell.openItem(escapedPath);
            console.log(`shell.openItem() returned ${ret}`);
        }
    });
}
