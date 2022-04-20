/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { spawn } from 'child_process';
import { App } from 'pc-nrfconnect-shared';

import { nRFConnectForDesktop } from '../detectExistingInstallation';

const openConnect = () => {
    spawn(nRFConnectForDesktop);
};

const Main = () => (
    <>
        <strong>The Bluetooth Low Energy app has moved.</strong>

        <p>
            Due to a breaking change in electron (
            <a href="https://github.com/electron/electron/issues/18397">
                github issue
            </a>
            ), the effort to rewrite the underlying libraries used by the
            current Bluetooth Low Energy is not feasible for us at this moment.
            The solution for now is to offer you a standalone version of the app
            that uses the version of electron supporting it, so we can update
            nRF Connect For Desktop to the newest electron version.
        </p>

        <p className="text-muted">
            Your current installation is located at: {nRFConnectForDesktop}
        </p>

        {nRFConnectForDesktop && (
            <>
                <button type="button" onClick={openConnect}>
                    Launch ble standalone
                </button>
            </>
        )}
    </>
);

export default () => {
    return (
        <App
            deviceSelect={null}
            sidePanel={null}
            showLogByDefault={false}
            panes={[{ name: 'Main', Main }]}
        />
    );
};
