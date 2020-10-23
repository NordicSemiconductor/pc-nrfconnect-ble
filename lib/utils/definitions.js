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

/* These exports exist to indicate formating of the content in a characteristic.
 * Example:
 *    '2A00': { name: 'Device Name', format: TEXT },
 *    will format the data in the characteristic with UUID 2A00 as text.
 *
 * The default is NO_FORMAT which will present the data raw.
 */
export const TEXT = 'TEXT';
export const NO_FORMAT = 'NO_FORMAT';

export const GENERIC_ACCESS_UUID = '1800';
export const DEVICE_NAME_UUID = '2A00';
export const SECURE_DFU_UUID = 'FE59';

/* eslint quote-props: ["error", "as-needed", { "numbers": true, "unnecessary": false }] */

export const uuid16bitCharacteristicDefinitions = {
    [DEVICE_NAME_UUID]: { format: TEXT },
    '2A24': { name: 'Model Number String', format: TEXT },
    '2A25': { name: 'Serial Number String', format: TEXT },
    '2A26': { name: 'Firmware Revision String', format: TEXT },
    '2A27': { name: 'Hardware Revision String', format: TEXT },
    '2A28': { name: 'Software Revision String', format: TEXT },
    '2A29': { name: 'Manufacturer Name String', format: TEXT },
    '2A87': { name: 'Email Address', format: TEXT },
    '2A8A': { name: 'First Name', format: TEXT },
    '2A90': { name: 'Last Name', format: TEXT },
    '2AB5': { name: 'Location Name', format: TEXT },
};

export const uuid128bitCharacteristicDefinitions = {
    // thingy configuration service UUIDs:
    EF6801019B3549339B1052FFA9740042: { name: 'Device Name', format: TEXT },
    EF6801069B3549339B1052FFA9740042: { name: 'Cloud Token', format: TEXT },
};
