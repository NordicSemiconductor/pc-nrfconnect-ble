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


/* eslint quote-props: ["error", "as-needed", { "numbers": true, "unnecessary": false }] */

import nrfjprog from 'pc-nrfjprog-js';

export const familyDefinitions = {
    [nrfjprog.NRF51_FAMILY]: 'nRF51',
    [nrfjprog.NRF52_FAMILY]: 'nRF52',
    [nrfjprog.UNKNOWN_FAMILY]: 'Unknown family',
};

export const deviceTypeDefinitions = {
    [nrfjprog.NRF51xxx_xxAA_REV1]: 'nRF51',
    [nrfjprog.NRF51xxx_xxAA_REV2]: 'nRF51',
    [nrfjprog.NRF51xxx_xxAC_REV3]: 'nRF51',
    [nrfjprog.NRF51xxx_xxAA_REV3]: 'nRF51',
    [nrfjprog.NRF51xxx_xxAB_REV3]: 'nRF51',
    [nrfjprog.NRF51802_xxAA_REV3]: 'nRF51802',
    [nrfjprog.NRF52832_xxAA_ENGA]: 'nRF52832',
    [nrfjprog.NRF52832_xxAA_REV1]: 'nRF52832',
    [nrfjprog.NRF52832_xxAA_ENGB]: 'nRF52832',
    [nrfjprog.NRF52840_xxAA_ENGA]: 'nRF52840',
    [nrfjprog.NRF52832_xxAA_FUTURE]: 'nRF52832',
    [nrfjprog.NRF52840_xxAA_FUTURE]: 'nRF52840',
    [nrfjprog.NRF52810_xxAA_REV1]: 'nRF52810',
    [nrfjprog.NRF52810_xxAA_FUTURE]: 'nRF52810',
    [nrfjprog.NRF52832_xxAB_REV1]: 'nRF52832',
    [nrfjprog.NRF52832_xxAB_FUTURE]: 'nRF52832',
    [nrfjprog.NRF51801_xxAB_REV3]: 'nRF51801',
};
