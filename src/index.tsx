/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { getCurrentWindow } from '@electron/remote';
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

    const isSamePath = (
        executablePath: string,
        directoryPath: string
    ): boolean =>
        executablePath.split('\\').slice(0, -1).join('\\') === directoryPath;

    return (
        <div className="d-flex h-100">
            <div className="floating-card">
                <div className="title">
                    {updateAvailable ? 'Update' : 'Install'}
                </div>
                <div className="content p-3 pt-4">
                    {progress === undefined && (
                        <>
                            {updateAvailable && (
                                <>
                                    <p>An update is available</p>
                                    <p className="mb-0">
                                        Installed version: {version}.
                                    </p>
                                    <p>Available version: {bleVersion}.</p>
                                </>
                            )}

                            <p>
                                {!exePath && progress === undefined && (
                                    <>
                                        Bluetooth Low Energy is now a standalone
                                        app.
                                        {process.platform === 'win32' && (
                                            <p className="mt-1">
                                                The standalone application can
                                                be uninstalled from the control
                                                panel.
                                            </p>
                                        )}
                                    </>
                                )}
                            </p>

                            {exePath &&
                                !isSamePath(exePath, programDirectory()) && (
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
                                            The standalone application will be
                                            installed at:
                                        </p>
                                        <p className="path">
                                            {programDirectory()}
                                        </p>
                                        <p className="mb-4">
                                            File size: {downloadSize}MB
                                        </p>
                                    </div>

                                    <div className="d-flex justify-content-end">
                                        {exePath && progress === undefined && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary font-size-12 mr-1"
                                                onClick={runExecutable}
                                            >
                                                Open current version
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
                                                    : 'Download and install'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                    {progress !== undefined && (
                        <>
                            <p>Downloading...</p>
                            <ProgressBar now={progress} />
                            <div className="d-flex justify-content-end mt-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-dark font-size-12"
                                    onClick={cancel}
                                    style={{ width: '150px' }}
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
