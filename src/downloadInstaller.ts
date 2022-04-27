/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net } from '@electron/remote';
import { mkdtemp, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

export const downloadInstaller = (progress: (percentage: number) => void) => {
    const urlBase =
        'https://github.com/NordicPlayground/pc-nrfconnect-ble-standalone/releases/download/v3.10.1/';

    const file = (<{ [key in typeof process.platform]: string }>{
        win32: 'nrfconnect-bluetooth-le-setup-3.10.1-x64.exe',
        linux: 'nrfconnect-bluetooth-le-3.10.1-x86_64.AppImage',
    })[process.platform];

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
    const tmpdir = await mkdtemp('nrfconnect-ble-standalone');
    const path = join(tmpdir, 'nrfconnect-bluetooth-le-setup-3.10.1-x64.exe');

    await writeFile(path, buffer);
    return resolve(path);
};
