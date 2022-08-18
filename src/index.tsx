/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { getCurrentWindow } from '@electron/remote';
import { dirname } from 'path';
import { App } from 'pc-nrfconnect-shared';
import { lt } from 'semver';

import { baseDownloadUrl, bleVersion, downloadSize } from './config';
import { downloadInstaller, saveBufferToPath } from './downloadInstaller';
import { getProgramPath, programDirectory } from './paths';
import { currentVersion, runExecutable, runInstaller } from './run';

import './style.css';

let abortController = new AbortController();

const Main = () => {
    const [progress, setProgress] = useState<number>();
    const [version, setVersion] = useState<string>();
    const [exePath, setExePath] = useState<string>();
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        const current = currentVersion();
        const existingPath = getProgramPath();
        setExePath(existingPath);
        setVersion(current);

        if (lt(current ?? '0.0.0', bleVersion) && existingPath) {
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
            if (process.platform === 'darwin' || process.platform === 'linux') {
                getCurrentWindow().close();
            }
        } catch {
            setErrorMessage(
                `Downloading the installer failed, try to get the release from ${baseDownloadUrl}`
            );
        }
    };

    const cancel = () => {
        abortController.abort();
        abortController = new AbortController();
        setProgress(undefined);
    };

    return (
        <div className="d-flex h-100">
            <div className="floating-card">
                <div className="title">
                    Bluetooth Low Energy Application{' '}
                    {updateAvailable ? 'Update' : 'Installation'}
                </div>
                <div className="content p-3 pt-4">
                    {progress === undefined && (
                        <>
                            {updateAvailable && (
                                <>
                                    <p>
                                        An update is available for this
                                        application
                                    </p>
                                    <ul>
                                        <li>Installed version: {version}.</li>
                                        <li>
                                            Available version: {bleVersion}.
                                        </li>
                                    </ul>
                                </>
                            )}

                            {!exePath && progress === undefined && (
                                <p>
                                    The Bluetooth Low Energy application has
                                    been converted to a standalone application
                                    for compatibility reasons. It may however
                                    still be opened from nRF Connect for
                                    Desktop.
                                </p>
                            )}

                            {exePath &&
                                dirname(exePath) !== programDirectory() && (
                                    <>
                                        <p>
                                            Your current installation is located
                                            at:
                                        </p>
                                        <p className="path">{exePath}</p>
                                    </>
                                )}

                            {errorMessage && (
                                <div
                                    className="alert alert-danger"
                                    style={{ userSelect: 'text' }}
                                >
                                    {errorMessage}
                                </div>
                            )}

                            {(exePath === undefined ||
                                (updateAvailable && !errorMessage)) && (
                                <>
                                    <div className="d-flex flex-column mb-0">
                                        <p>
                                            Click the button below to install
                                            the application at the following
                                            path:
                                        </p>
                                        <p className="path">
                                            {programDirectory()}
                                        </p>
                                        <p>File size: {downloadSize}MB</p>
                                        {process.platform === 'win32' && (
                                            <p>
                                                The standalone application may
                                                be uninstalled from the Windows
                                                Control Panel.
                                            </p>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-end mt-4">
                                        {exePath && progress === undefined && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary font-size-12 mr-1"
                                                onClick={runExecutable}
                                            >
                                                Open Current Version
                                            </button>
                                        )}
                                        {progress === undefined && (
                                            <button
                                                type="button"
                                                className="btn btn-primary font-size-12"
                                                onClick={download}
                                                style={{ width: '150px' }}
                                            >
                                                {updateAvailable
                                                    ? 'Update Application'
                                                    : 'Download and Install'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                    {progress !== undefined && (
                        <>
                            <p>Downloading {exePath ? 'update' : 'files'}...</p>
                            <ProgressBar now={progress} />
                            <div className="d-flex justify-content-end mt-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary font-size-12"
                                    onClick={cancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default () => (
    <App
        deviceSelect={null}
        sidePanel={null}
        showLogByDefault={false}
        panes={[{ name: 'INSTALL', Main }]}
    />
);
