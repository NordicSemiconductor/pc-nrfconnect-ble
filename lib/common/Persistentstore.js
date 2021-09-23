/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';

export const store = new Store({ name: 'pc-nrfconnect-ble' });

const ADV_KEY = 'Adv';
const SCAN_KEY = 'Scan';
const AUTO_ACCEPT_KEY = 'AutoAccept';
const AUTO_UPDATE_KEY = 'AutoUpdate';
const SECURITY_KEY = 'Security';
const ACTIVE_SCAN = 'ActiveScan';
const SCAN_TIMEOUT = 'ScanTimeout';
const ADV_PARAMS = 'AdvParams';
const CON_PARAMS = 'ConParams';

function writeToStore(key) {
    return function setParams(params) {
        if (params !== undefined && params !== null) {
            store.set(key, params);
        }
    };
}

export const persistentStore = {
    setAdvSetup: writeToStore(ADV_KEY),
    setScanResponse: writeToStore(SCAN_KEY),
    setSecParams: writeToStore(SECURITY_KEY),
    setAutoAcceptPairing: writeToStore(AUTO_ACCEPT_KEY),
    setAutoConnUpdate: writeToStore(AUTO_UPDATE_KEY),
    setActiveScan: writeToStore(ACTIVE_SCAN),
    setScanTimeout: writeToStore(SCAN_TIMEOUT),
    setAdvParams: writeToStore(ADV_PARAMS),
    setConnectionParams: writeToStore(CON_PARAMS),
    secParams: defaultParams => ({
        ...defaultParams,
        ...store.get(SECURITY_KEY),
    }),
    advSetup: () => store.get(ADV_KEY, []),
    scanResponse: () => store.get(SCAN_KEY, []),
    autoAcceptPairing: () => store.get(AUTO_ACCEPT_KEY, true),
    autoConnUpdate: () => store.get(AUTO_UPDATE_KEY, true),
    activeScan: () => store.get(ACTIVE_SCAN, true),
    scanTimeout: () => store.get(SCAN_TIMEOUT, 60),
    advParams: () => store.get(ADV_PARAMS, { interval: 100, timeout: 0 }),
    connectionParams: defaultParams => ({
        ...defaultParams,
        ...store.get(CON_PARAMS),
    }),
};
