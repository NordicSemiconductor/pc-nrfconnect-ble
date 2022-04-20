/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

const Main = () => <div>Bluetooth app has moved to standalone</div>;

export default () => {
    return (
        <App
            appReducer={null}
            deviceSelect={null}
            sidePanel={null}
            showLogByDefault={false}
            panes={[{ name: 'Main', Main }]}
        />
    );
};
