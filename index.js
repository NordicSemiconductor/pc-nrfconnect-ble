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

var app = require('app');
var BrowserWindow = require('browser-window');
var crashReporter = require('crash-reporter');
crashReporter.start();

var mainWindow = null;

global.logFileDir = app.getPath('userData');

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 800,
        'min-width': 480,
        'min-height': 280,
        frame: true
    });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.on('closed', function() {
        console.log("windows closed");
        mainWindow = null;
    });
//  console.log(app.getTitle());
    console.log('je');
    mainWindow.webContents.on('did-finish-load',function() {
        mainWindow.setTitle('Yggdrasil');
    });
});
