/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';

const common = 'nrfconnect-bluetooth-le';

export function getInstallationPath() {
    const path = resolveNrfConnectForDesktop();
    return existsSync(path) ? path : undefined;
}

function resolveNrfConnectForDesktop(): string {
    // Check for the execPath file in the shared folder.
    const desktopDataPath = resolveNrfConnectForDesktopDataPath();
    const execPath = join(desktopDataPath, 'execPath');

    if (existsSync(execPath)) {
        return readFileSync(execPath, { encoding: 'utf8', flag: 'r' });
    }

    if (process.platform === 'win32') {
        return resolve(
            homedir(),
            `AppData\\Local\\Programs\\${common}\\nRF Connect for Desktop BLE.exe`
        );
    }

    if (process.platform === 'darwin') {
        return '/Applications/nRF Connect for Desktop.app/Contents/MacOS/nRF Connect for Desktop BLE';
    }
    return '';
}

function resolveNrfConnectForDesktopDataPath(): string {
    return (
        // Windows
        join(homedir(), 'APPDATA', 'Roaming', common),
        // macOS
        join(homedir(), 'Library', 'Application Support', common),
        // Linux
        join(homedir(), '.config', common)
    );
}
