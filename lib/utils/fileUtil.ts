/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import childProcess from 'child_process';
import { shell } from 'electron';
import fs from 'fs';
import os from 'os';

export default function openFileInDefaultApplication(filePath, callback) {
    fs.exists(filePath, exists => {
        if (!exists) {
            if (callback) {
                callback(new Error(`Could not find file at path: ${filePath}`));
            }

            return;
        }

        const escapedPath = filePath.replace(/ /g, '\\ ');

        // Could not find a method that works on all three platforms:
        // * shell.openPath works on Windows and Linux but not on OSX
        // * childProcess.execSync works on OSX but not on Windows
        if (os.type() === 'Darwin') {
            childProcess.execSync(`open  ${escapedPath}`);
        } else {
            shell.openPath(escapedPath);
        }
    });
}
