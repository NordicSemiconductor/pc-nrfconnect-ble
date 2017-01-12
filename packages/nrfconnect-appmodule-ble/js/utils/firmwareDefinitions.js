/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

/**
 * Input to pc-nrfjprog-js when updating connectivity firmware. Using the webpack
 * raw-loader to load the content of hex files into the bundle as strings.
 *
 * 0: String containing firmware for nRF51
 * 1: String containing firmware for nRF52
 * filecontent: Boolean specifying if the values of 0 and 1 are actual firmware
 *              content or filesystem paths (true if content, false if paths)
 */

export const firmwareDefinitions115k2 = {
    0: require('raw!pc-ble-driver-js/pc-ble-driver/hex/sd_api_v2/connectivity_1.1.0_115k2_with_s130_2.0.1.hex'),
    1: require('raw!pc-ble-driver-js/pc-ble-driver/hex/sd_api_v3/connectivity_1.1.0_115k2_with_s132_3.0.hex'),
    filecontent: true,
};

export const firmwareDefinitions1m = {
    0: require('raw!pc-ble-driver-js/pc-ble-driver/hex/sd_api_v2/connectivity_1.1.0_1m_with_s130_2.0.1.hex'),
    1: require('raw!pc-ble-driver-js/pc-ble-driver/hex/sd_api_v3/connectivity_1.1.0_1m_with_s132_3.0.hex'),
    filecontent: true,
};
