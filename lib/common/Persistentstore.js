/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import Store from 'electron-store';

export const store = new Store({ name: 'pc-nrfconnect-ble' });

const ADV_KEY = 'Adv';
const SCAN_KEY = 'Scan';
const AUTO_ACCEPT_KEY = 'AutoAccept';
const AUTO_UPDATE_KEY = 'AutoUpdate';
const SECURITY_KEY = 'Security';

function writeToStore(key) {
    // eslint-disable-next-line func-names
    return function (params) {
        if (params !== undefined && params !== null) {
            store.set(key, params);
        }
    };
}

export const persistentStore = {
    setAdv: writeToStore(ADV_KEY),
    setScanResponse: writeToStore(SCAN_KEY),
    setSecParams: writeToStore(SECURITY_KEY),
    setAutoAcceptPairing: writeToStore(AUTO_ACCEPT_KEY),
    setAutoConnUpdate: writeToStore(AUTO_UPDATE_KEY),
    secParams: defaultParams => ({
        ...defaultParams,
        ...store.get(SECURITY_KEY),
    }),
    get advSetup() {
        return store.get(ADV_KEY, []);
    },
    get scanResponse() {
        return store.get(SCAN_KEY, []);
    },
    get autoAcceptPairing() {
        return store.get(AUTO_ACCEPT_KEY, true);
    },
    get autoConnUpdate() {
        return store.get(AUTO_UPDATE_KEY, true);
    },
};
