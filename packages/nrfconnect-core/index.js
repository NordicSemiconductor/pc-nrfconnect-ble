/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

 'use strict';

const VERSION = '1.1.1';

const os = require('os');
const fs = require('fs');
const path = require('path');
const electron = require('electron');
const app = electron.app;

app.setPath('userData', path.join(app.getPath('appData'), 'nrfconnect'));
const settings = require('./settings');

global.keymap = path.join(app.getPath('userData'), 'keymap.cson');
global.userDataDir = app.getPath('userData');
global.appPath = app.getAppPath();

app.on('window-all-closed', function () {
    app.quit();
});

function createSplashScreen() {
    let splashScreen = new electron.BrowserWindow({
        width: 400,
        height: 223,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        transparent: true
    });
    splashScreen.loadURL('file://' + __dirname + '/resources/splashScreen.html');
    splashScreen.on('closed', function () {
        splashScreen = null;
    });
    splashScreen.show();
    return splashScreen;
}

function createBrowserWindow(options) {
    const lastWindowState = settings.loadLastWindow();
    const mergedOptions = Object.assign({
        x: lastWindowState.x,
        y: lastWindowState.y,
        width: lastWindowState.width,
        height: lastWindowState.height,
        minWidth: 308,
        minHeight: 499,
        show: false,
        autoHideMenuBar: true,
    }, options);
    let browserWindow = new electron.BrowserWindow(mergedOptions);

    let splashScreen;
    if (options.splashScreen) {
        splashScreen = createSplashScreen();
    }

    browserWindow.loadURL(options.url);

    browserWindow.on('close', function () {
        if (options.keepWindowSettings !== false) {
            settings.storeLastWindow(browserWindow);
        }
    });

    browserWindow.on('closed', function () {
        browserWindow = null;
    });

    browserWindow.webContents.on('did-finish-load', function () {
        if (splashScreen && !splashScreen.isDestroyed()) {
            splashScreen.close();
        }

        if (lastWindowState.maximized) {
            browserWindow.maximize();
        }

        if (options.menu) {
            _createDefaultMenu();
        }

        let title = 'nRF Connect v' + VERSION;
        if (options.title) {
            title += ' - ' + options.title;
        }
        browserWindow.setTitle(title);
        browserWindow.show();
    });

    return browserWindow;
}

function _createDefaultMenu() {
    let template = [
        {
            label: '&File',
            submenu: [
                {
                    label: '&Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function () {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
            ],
        },
        {
            label: '&View',
            submenu: [
                {
                    label: '&Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    },
                },
                {
                    label: 'Toggle &Full Screen',
                    accelerator: process.platform == 'darwin' ? 'Ctrl+Command+F' : 'F11',
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    },
                },
                {
                    label: 'Toggle &Developer Tools',
                    accelerator: process.platform == 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    visible: false,
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    },
                },
            ],
        },
    ];

    if (process.platform == 'darwin') {
        template.unshift({
            label: 'Electron',
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function () {
                        app.quit();
                    },
                },
            ],
        });
    }

    let Menu = electron.Menu;
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}


module.exports = {
    createBrowserWindow: createBrowserWindow
};
