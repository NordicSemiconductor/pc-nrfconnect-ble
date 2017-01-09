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

let electron = require('electron');
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;
require('nrfconnect-core/index');

let splashScreen = null;
let loaderWindow = null;

let ipcMain = electron.ipcMain;

ipcMain.on('load-appmodule', function (event, name) {
    require(name);
    if (loaderWindow) {
        loaderWindow.close();
    }
});

app.on('ready', function () {
    splashScreen = new BrowserWindow({
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

    loaderWindow = new BrowserWindow({
        width: 500,
        height: 370,
        resizable: false,
        show: false,
        icon: __dirname + '/resources/icon.png',
    });
    // Remove this to enable menu and Chrome devtools
    loaderWindow.setMenu(null);

    loaderWindow.loadURL('file://' + __dirname + '/index.html');

    loaderWindow.on('closed', function () {
        loaderWindow = null;
        if (splashScreen) {
            splashScreen.close();
        }
    });

    loaderWindow.webContents.on('did-finish-load', function () {
        if (splashScreen) {
            splashScreen.close();
        }

        loaderWindow.setTitle('nRF Connect v1.0');
        loaderWindow.show();
    });

    loaderWindow.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        electron.shell.openExternal(url);
    });
});
