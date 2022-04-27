/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net } from '@electron/remote';
import { chmod, mkdir, mkdtemp, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';

import { getInstallationPath } from './detectExistingInstallation';

export const downloadInstaller = (progress: (percentage: number) => void) => {
    const urlBase =
        'https://github.com/NordicPlayground/pc-nrfconnect-ble-standalone/releases/download/v3.10.1/';

    const file = executableName;

    return new Promise<Buffer>(finish => {
        const request = net.request(urlBase + file);
        request.on('response', response => {
            const buffer: Buffer[] = [];
            const total = Number(response.headers['content-length']);

            let current = 0;
            response.on('data', data => {
                current += data.length;
                buffer.push(data);
                progress(Math.round((1000 * current) / total / 10));
            });

            response.on('end', () => finish(Buffer.concat(buffer)));
        });
        request.end();
    });
};

export const saveBufferToPath = async (buffer: Buffer) => {
    const directory = await (async () => {
        switch (process.platform) {
            case 'win32': {
                const path = await mkdtemp('nrfconnect-ble-standalone');
                return path;
            }
            case 'linux': {
                const currentInstallationPath = getInstallationPath();
                if (currentInstallationPath) {
                    return dirname(currentInstallationPath);
                }
                const path = resolve(
                    homedir(),
                    'opt',
                    'nrfconnect-bluetooth-le'
                );
                await mkdir(path, { recursive: true });
                return path;
            }

            default:
                throw new Error('Unsupported platform');
        }
    })();
    const path = join(directory, executableName);

    await writeFile(path, buffer);
    if (process.platform === 'linux') {
        await chmod(path, 0o755);
    }
    return resolve(path);
};

const executableName = (() => {
    switch (process.platform) {
        case 'win32':
            return 'nrfconnect-bluetooth-le-setup-3.10.1-x64.exe';
        case 'linux':
            return 'nrfconnect-bluetooth-le-3.10.1-x86_64.AppImage';
        default:
            throw new Error(`Platform ${process.platform} is not supported`);
    }
})();
