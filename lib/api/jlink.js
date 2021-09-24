/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const familyDefinitions = {
    NRF51: 'nrf51',
    NRF52: 'nrf52',
    UNKNOWN: 'unknown',
};

const deviceTypeDefinitions = {
    NRF51xxx_xxAA_REV1: 'nRF51',
    NRF51xxx_xxAA_REV2: 'nRF51',
    NRF51xxx_xxAC_REV3: 'nRF51',
    NRF51xxx_xxAA_REV3: 'nRF51',
    NRF51xxx_xxAB_REV3: 'nRF51',
    NRF51802_xxAA_REV3: 'nRF51802',
    NRF52832_xxAA_ENGA: 'nRF52832',
    NRF52832_xxAA_REV1: 'nRF52832',
    NRF52832_xxAA_REV2: 'nRF52832',
    NRF52832_xxAA_ENGB: 'nRF52832',
    NRF52840_xxAA_ENGA: 'nRF52840',
    NRF52832_xxAA_FUTURE: 'nRF52832',
    NRF52840_xxAA_FUTURE: 'nRF52840',
    NRF52810_xxAA_REV1: 'nRF52810',
    NRF52810_xxAA_FUTURE: 'nRF52810',
    NRF52832_xxAB_REV1: 'nRF52832',
    NRF52832_xxAB_FUTURE: 'nRF52832',
    NRF51801_xxAB_REV3: 'nRF51801',
};

export const getJlinkDeviceInfo = ({ jlink }) => ({
    family: familyDefinitions[jlink.deviceFamily] || 'unknown',
    type: deviceTypeDefinitions[jlink.deviceVersion] || 'unknown',
    firmwareString: jlink.jlinkObFirmwareVersion,
});
