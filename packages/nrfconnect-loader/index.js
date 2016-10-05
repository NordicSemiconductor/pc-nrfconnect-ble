/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
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
