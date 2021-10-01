/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import DiscoveredDevices from '../containers/DiscoveredDevices';

export default () => (
    <SidePanel>
        <DiscoveredDevices />
    </SidePanel>
);
