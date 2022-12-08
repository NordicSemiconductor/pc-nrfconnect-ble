/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const bleVersion = '4.0.4';
export const packageName = 'nrfconnect-bluetooth-low-energy';
export const baseDownloadUrl = `https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/bluetooth-standalone/v${bleVersion}/`;
export const downloadSize = {
    win32: '102',
    darwin: '121',
    linux: '132',
}[<string>process.platform];
