/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { getCurrentWindow } from '@electron/remote';
import { spawn } from 'child_process';
import { App } from 'pc-nrfconnect-shared';

import { getInstallationPath } from './detectExistingInstallation';
import { downloadInstaller, saveBufferToPath } from './downloadInstaller';

const Main = () => {
    const [progress, setProgress] = useState(0);
    const [exePath, setExePath] = useState<string>();

    useEffect(() => {
        const path = getInstallationPath();
        setExePath(path);
        if (path !== undefined) {
            // Open the app and close this window
            spawn(path, {
                detached: true,
            });
            getCurrentWindow().close();
        }
    }, []);

    const openConnect = () => {
        if (exePath !== undefined) {
            spawn(exePath);
            getCurrentWindow().close();
        }
    };

    const download = async () => {
        const buffer = await downloadInstaller(setProgress);
        const path = await saveBufferToPath(buffer);
        const installerProcess = spawn(path);
        installerProcess.on('close', code => {
            if (code === 0) {
                // Installation complete
                getCurrentWindow().close();
            }
        });
    };

    return (
        <>
            <strong>The Bluetooth Low Energy app has moved.</strong>

            <p>
                Due to a breaking change in electron (
                <a href="https://github.com/electron/electron/issues/18397">
                    github issue
                </a>
                ), the effort to rewrite the underlying libraries used by the
                current Bluetooth Low Energy is not feasible for us at this
                moment. The solution for now is to offer you a standalone
                version of the app that uses the version of electron supporting
                it, so we can update nRF Connect For Desktop to the newest
                electron version.
            </p>

            {exePath && (
                <>
                    <p className="text-muted">
                        Your current installation is located at: {exePath}
                    </p>
                    <button type="button" onClick={openConnect}>
                        Launch ble standalone
                    </button>
                </>
            )}

            {exePath === undefined && (
                <>
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={download}
                        >
                            Install Bluetooth Low Energy Standalone app
                        </button>

                        <ProgressBar
                            now={progress}
                            style={{ marginTop: '2em' }}
                        />
                    </div>
                </>
            )}
        </>
    );
};

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
