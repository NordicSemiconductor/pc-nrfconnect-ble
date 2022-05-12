/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { App } from 'pc-nrfconnect-shared';
import { lt } from 'semver';

import { bleVersion } from './config';
import { downloadInstaller, saveBufferToPath } from './downloadInstaller';
import { programPath } from './paths';
import { currentVersion, runExecutable, runInstaller } from './run';

let abortController = new AbortController();

const Main = () => {
    const [progress, setProgress] = useState<number>();
    const [version, setVersion] = useState<string>();
    const [exePath, setExePath] = useState<string>();
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        const current = currentVersion();
        setExePath(programPath());
        setVersion(current);

        if (lt(current ?? '0.0.0', bleVersion)) {
            // Update
            setUpdateAvailable(true);
        } else {
            runExecutable();
        }
    }, []);

    const download = async () => {
        try {
            const buffer = await downloadInstaller(
                setProgress,
                abortController.signal
            );
            const path = await saveBufferToPath(buffer);
            runInstaller(path);
        } catch {
            setErrorMessage(
                `Downloading the installer failed, try to get the latest release from https://github.com/NordicPlayground/pc-nrfconnect-ble-standalone/releases`
            );
        }
    };

    const cancel = () => {
        abortController.abort();
        abortController = new AbortController();
        setProgress(undefined);
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

            {updateAvailable && (
                <>
                    <div className="alert alert-info">
                        Update available: Detected version: {version}, new
                        version&nbsp;
                        {bleVersion}
                    </div>
                </>
            )}

            {exePath && (
                <>
                    <p className="text-muted">
                        Your current installation is located at: {exePath}
                    </p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={runExecutable}
                    >
                        Launch ble standalone
                    </button>
                </>
            )}

            {errorMessage && (
                <>
                    <div
                        className="alert alert-danger"
                        style={{ userSelect: 'text' }}
                    >
                        {errorMessage}
                    </div>
                </>
            )}

            {(exePath === undefined || (updateAvailable && !errorMessage)) && (
                <>
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={download}
                        >
                            Install Bluetooth Low Energy {bleVersion}
                        </button>
                        {progress !== undefined && (
                            <>
                                <ProgressBar
                                    now={progress}
                                    style={{ marginTop: '2em' }}
                                />

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={cancel}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
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
