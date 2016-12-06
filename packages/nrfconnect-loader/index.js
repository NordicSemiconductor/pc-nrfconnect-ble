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

const core = require('nrfconnect-core/index');

const electron = require('electron');
const ipcMain = electron.ipcMain;
const app = electron.app;

let loaderWindow = null;

ipcMain.on('load-appmodule', function (event, name) {
    require(name);
    if (loaderWindow) {
        loaderWindow.close();
    }
});

app.on('ready', function () {
    loaderWindow = core.createBrowserWindow({
        width: 500,
        height: 370,
        resizable: false,
        keepWindowSettings: false,
        splashScreen: true,
        url: 'file://' + __dirname + '/index.html',
        icon: __dirname + '/resources/icon.png',
    });

    // Remove this to enable menu and Chrome devtools
    loaderWindow.setMenu(null);
});
