/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow } from '@electron/remote';
import { exec, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { usageData } from 'pc-nrfconnect-shared';

import { bleVersion } from './config';
import { configDirectory, getProgramPath } from './paths';

export const runInstaller = (path: string) => {
    usageData.sendUsageData(
        'Running standalone installer',
        `${bleVersion}, ${process.platform}`
    );

    switch (process.platform) {
        case 'darwin': {
            // e.g. /path/bluetooth-standalone-version.dmg
            exec(`open ${path}`);
            break;
        }
        case 'linux': {
            // e.g. /path/bluetooth-standalone-version.AppImage
            spawn(path);
            break;
        }
        case 'win32': {
            // e.g. C:\Users\User\AppData\local\Programs\nrfconnect-ble-standalone\nRF Connect for Desktop Bluetooth Low Energy.exe
            const installerProcess = spawn(path);
            installerProcess.on('close', code => {
                if (code === 0) {
                    // Installation complete
                    getCurrentWindow().close();
                }
            });
        }
    }
};

export const runExecutable = () => {
    const path = getProgramPath();
    if (path !== undefined) {
        usageData.sendUsageData(
            'Running standalone app',
            `${bleVersion}, ${process.platform}`
        );

        // Open the app and close this window
        spawn(path, { detached: true });
        getCurrentWindow().close();
    }
};

export const currentVersion = () => {
    const versionFile = join(configDirectory(), 'version');
    return existsSync(versionFile)
        ? readFileSync(versionFile, { encoding: 'utf-8' })
        : undefined;
};
