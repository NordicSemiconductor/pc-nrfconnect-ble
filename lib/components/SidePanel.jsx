/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import BLEEventDialog from '../containers/BLEEventDialog';
import DiscoveredDevices from '../containers/DiscoveredDevices';

export default () => (
    <SidePanel>
        <DiscoveredDevices />

        {/* The BLEEventDialog is not really part of the side panel but should
            rather defined in the app component, as soon as we allow global
            components in there */}
        <BLEEventDialog />
    </SidePanel>
);
