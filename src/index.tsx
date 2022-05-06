/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { App } from 'pc-nrfconnect-shared';

import { downloadInstaller, saveBufferToPath } from './downloadInstaller';
import { runExecutable, runInstaller } from './run';

const Main = () => {
    const [progress, setProgress] = useState(0);
    const [exePath, setExePath] = useState<string>();

    useEffect(() => {
        const path = runExecutable();
        setExePath(path);
    }, []);

    const download = async () => {
        const buffer = await downloadInstaller(setProgress);
        const path = await saveBufferToPath(buffer);
        runInstaller(path);
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
                    <button type="button" onClick={runExecutable}>
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
