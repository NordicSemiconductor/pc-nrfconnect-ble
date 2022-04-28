import { getCurrentWindow } from '@electron/remote';
import { exec, spawn } from 'child_process';

import { getProgramPath } from './paths';

export const runInstaller = (path: string) => {
    switch (process.platform) {
        case 'darwin': {
            // e.g. /path/bluetooth-standalone-version.dmg
            exec(`open ${path}`);
            break;
        }
        case 'linux': {
            // e.g. /path/bluetooth-standalone-version.AppImage
            spawn(path);
            break;
        }
        case 'win32': {
            // e.g. C:\Users\User\AppData\local\Programs\nrfconnect-ble-standalone\nRF Connect for Desktop Bluetooth.exe
            const installerProcess = spawn(path);
            installerProcess.on('close', code => {
                if (code === 0) {
                    // Installation complete
                    getCurrentWindow().close();
                }
            });
        }
    }
};

export const runExecutable = () => {
    const path = getProgramPath();
    if (path !== undefined) {
        // Open the app and close this window
        spawn(path, { detached: true });
        getCurrentWindow().close();
    }
    return path;
};
