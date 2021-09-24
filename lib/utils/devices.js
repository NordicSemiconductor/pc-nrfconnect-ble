/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

export const SupportedJLinkDevices = [
    'PCA10028',
    'PCA10031',
    'PCA10040',
    'PCA10056',
    'PCA10100',
];

export function isSupportedJLinkDevice(boardVersion) {
    return SupportedJLinkDevices.includes(boardVersion);
}

export function supportedJLinkDevicesString() {
    return SupportedJLinkDevices.join(', ');
}
