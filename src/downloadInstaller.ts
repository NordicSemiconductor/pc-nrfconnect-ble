/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net } from '@electron/remote';
import { chmod, mkdir, mkdtemp, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';
import { usageData } from 'pc-nrfconnect-shared';

import { baseDownloadUrl, bleVersion, packageName } from './config';
import { getProgramPath } from './paths';

export const downloadInstaller = (progress: (percentage: number) => void) => {
    usageData.sendUsageData(
        'Downloading standalone installer',
        `${bleVersion}, ${process.platform}`
    );

    const file = installerName;

    return new Promise<Buffer>(finish => {
        const request = net.request(baseDownloadUrl + file);
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
    // Find directory for installer, make it, if non-existant
    const directory = await (async () => {
        switch (process.platform) {
            case 'darwin':
            case 'win32': {
                const path = await mkdtemp('nrfconnect-ble-standalone');
                return path;
            }
            case 'linux': {
                const currentInstallationPath = getProgramPath();
                if (currentInstallationPath) {
                    return dirname(currentInstallationPath);
                }
                const path = resolve(homedir(), 'opt', packageName);
                await mkdir(path, { recursive: true });
                return path;
            }

            default:
                throw new Error('Unsupported platform');
        }
    })();
    const path = join(directory, installerName);

    await writeFile(path, buffer);
    if (process.platform === 'linux') {
        await chmod(path, 0o755);
    }
    return resolve(path);
};

const installerName = (() => {
    switch (process.platform) {
        case 'win32':
            return `${packageName}-setup-${bleVersion}-x64.exe`;
        case 'linux':
            return `${packageName}-${bleVersion}-x86_64.AppImage`;
        case 'darwin':
            return `${packageName}-${bleVersion}.dmg`;
        default:
            throw new Error(`Platform ${process.platform} is not supported`);
    }
})();
