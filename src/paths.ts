/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';

import { bleVersion, packageName } from './config';

export const urlBase =
    'https://github.com/NordicPlayground/pc-nrfconnect-ble-standalone/releases/download/v3.10.1/';

export function getProgramPath() {
    const path = programPath();
    return path && existsSync(path) ? path : undefined;
}

export function programPath() {
    // Check for the execPath file in the shared folder.
    const desktopDataPath = configDirectory();
    const execPath = join(desktopDataPath, 'execPath');

    if (existsSync(execPath)) {
        return readFileSync(execPath, { encoding: 'utf8', flag: 'r' });
    }

    const directory = programDirectory();

    if (process.platform === 'win32') {
        return resolve(
            directory,
            'nRF Connect for Desktop Bluetooth Low Energy.exe'
        );
    }

    if (process.platform === 'darwin') {
        return directory;
    }

    if (process.platform === 'linux') {
        return resolve(
            directory,
            `${packageName}-${bleVersion}-x86_64.AppImage`
        );
    }

    throw new Error(
        `No suitable home directory found for platform: ${process.platform}`
    );
}

export function programDirectory() {
    // Check for the execPath file in the shared folder.
    const configPath = configDirectory();
    const execPath = join(configPath, 'execPath');

    if (existsSync(execPath)) {
        return dirname(readFileSync(execPath, { encoding: 'utf8', flag: 'r' }));
    }

    // Fall back to best guess per platform.
    if (process.platform === 'win32') {
        return resolve(homedir(), 'AppData', 'Local', 'Programs', packageName);
    }

    if (process.platform === 'darwin') {
        return '/Applications/nRF Connect for Desktop Bluetooth Low Energy.app/Contents/MacOS/nRF Connect for Desktop Desktop Bluetooth Low Energy';
    }

    if (process.platform === 'linux') {
        return resolve(homedir(), 'opt', packageName);
    }

    throw new Error(
        `No suitable home directory found for platform: ${process.platform}`
    );
}

export function configDirectory(): string {
    switch (process.platform) {
        case 'win32':
            return join(homedir(), 'APPDATA', 'Roaming', packageName);
        case 'darwin':
            return join(
                homedir(),
                'Library',
                'Application Support',
                packageName
            );
        case 'linux':
        default:
            return join(homedir(), '.config', packageName);
    }
}
