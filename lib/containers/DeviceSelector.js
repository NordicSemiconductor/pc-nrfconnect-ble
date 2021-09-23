/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { FirmwareRegistry } from 'pc-ble-driver-js';
import { DeviceSelector, logger } from 'pc-nrfconnect-shared';

import { closeAdapter, initAdapter } from '../actions/adapterActions';

const deviceListing = {
    jlink: true,
    nordicUsb: true,
    serialport: true,
};

const deviceSetup = {
    ...FirmwareRegistry.getDeviceSetup(),
    allowCustomDevice: true,
};

const mapState = () => ({
    deviceListing,
    deviceSetup,
});

const mapDispatch = dispatch => ({
    onDeviceSelected: device => {
        logger.info(`Selected device with s/n ${device.serialNumber}`);
    },
    releaseCurrentDevice: async () => {
        await dispatch(closeAdapter());
    },
    onDeviceIsReady: device => {
        logger.info('Device setup completed');
        dispatch(initAdapter(device));
    },
    onDeviceDeselected: async () => {
        await dispatch(closeAdapter());
        logger.info('Device closed.');
    },
});

export default connect(mapState, mapDispatch)(DeviceSelector);
