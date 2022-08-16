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

    return (
        <div className="d-flex h-100">
            <div className="floating-card">
                <div className="title">Install</div>
                <div className="content">
                    <p className="py-3">
                        {progress === undefined && (
                            <>Bluetooth Low Energy is now a standalone app.</>
                        )}
                        {progress !== undefined && (
                            <>
                                Downloading...
                                <ProgressBar now={progress} />
                            </>
                        )}
                    </p>

                    {updateAvailable && (
                        <div className="alert alert-info">
                            Update available: Detected version: {version}, new
                            version&nbsp;
                            {bleVersion}
                        </div>
                    )}

                    {exePath && (
                        <>
                            <p className="text-muted">
                                Your current installation is located at:{' '}
                                {exePath}
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={runExecutable}
                            >
                                Launch current version
                            </button>
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
                        <div className="d-flex">
                            <div className="flex-grow-1 install-file-info">
                                Target location: {programDirectory()}
                                <br />
                                File size: {downloadSize}MB
                            </div>
                            {progress === undefined && (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={download}
                                    style={{ width: '150px' }}
                                >
                                    Download and install
                                </button>
                            )}
                            {progress !== undefined && (
                                <button
                                    type="button"
                                    className="btn btn-outline-dark"
                                    onClick={cancel}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
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
