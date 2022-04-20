/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';

export const nRFConnectForDesktopDataPath =
    resolveNrfConnectForDesktopDataPath();

export const nRFConnectForDesktop = resolveNrfConnectForDesktop();

function resolveNrfConnectForDesktopDataPath(): string {
    const common = 'nrfconnect-bluetooth-le';

    return (
        // Windows
        join(homedir(), 'APPDATA', 'Roaming', common),
        // macOS
        join(homedir(), 'Library', 'Application Support', common),
        // Linux
        join(homedir(), '.config', common)
    );
}

function resolveNrfConnectForDesktop(): string {
    // Check for the execPath file in the shared folder.
    const execPath = join(nRFConnectForDesktopDataPath, 'execPath');

    if (existsSync(execPath)) {
        return readFileSync(execPath, { encoding: 'utf8', flag: 'r' });
    }

    // If it's not there, fallback to a best-effort guess.
    function firstAvailablePath(...paths: string[]) {
        // eslint-disable-next-line no-restricted-syntax
        for (const candidate of paths) {
            if (existsSync(candidate)) {
                return candidate;
            }
        }
        // It doesn't matter if the path doesn't exist; the user will be
        // warned later on if they call a function that uses it.
        return paths[0] as string;
    }

    if (process.platform === 'win32') {
        return resolve(
            homedir(),
            firstAvailablePath(
                'AppData\\Local\\Programs\\nrfconnect\\nRF Connect for Desktop.exe',
                'AppData\\Local\\Programs\\nrfconnect\\nRF Connect.exe'
            )
        );
    }

    if (process.platform === 'darwin') {
        return firstAvailablePath(
            '/Applications/nRF Connect for Desktop.app/Contents/MacOS/nRF Connect for Desktop',
            '/Applications/nRF Connect.app/Contents/MacOS/nRF Connect'
        );
    }
    return '';
}
