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
let ipcMain = electron.ipcMain;
let dialog = electron.dialog;
let shell = electron.shell;
let core = require('nrfconnect-core/index');

if (electron.app.isReady()) {
    initBrowserWindow();
} else {
    electron.app.on('ready', function () {
        initBrowserWindow();
    });
}

function initBrowserWindow() {
    const packageJson = require('./package.json');
    const browserWindow = core.createBrowserWindow({
        url: 'file://' + __dirname + '/index.html',
        icon: __dirname + '/' + packageJson.config.icon,
        menu: true,
        splashScreen: true,
    });

    browserWindow.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });
}

let filters =  [
    { name: 'nRF Connect Server Setup', extensions: ['ncs', 'json'] },
    { name: 'All Files', extensions: ['*'] },
];

ipcMain.on('save-server-setup', function (event, arg) {
    event.sender.send('save-server-setup-reply',
        dialog.showSaveDialog({ filters: filters, }));
});

ipcMain.on('load-server-setup', function (event, arg) {
    event.sender.send('load-server-setup-reply',
        dialog.showOpenDialog({ filters: filters,
            properties: ['openFile'],
        }));
});

ipcMain.on('choose-file-dialog', function (event, filters) {
    event.sender.send('choose-file-dialog-reply', dialog.showOpenDialog({
        title: 'Choose file',
        filters: filters,
        properties: ['openFile']
    }));
});
