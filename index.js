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
var Menu = require('menu');
var MenuItem = require('menu-item');
var open = require('open');
crashReporter.start();

var mainWindow = null;

global.logFileDir = app.getPath('userData');

app.on('window-all-closed', function() {
//    if (process.platform !== 'darwin') {
        app.quit();
//    }
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

    mainWindow.webContents.on('did-finish-load',function() {
        mainWindow.setTitle('Yggdrasil');
    });
});

// Create menu.
app.once('ready', function() {
    var template = [
        {
            label: '&File',
            submenu: [{label: '&Log file...', click: function() {open('license.txt');}},
                      {type: 'separator'},
                      {label: '&Quit', accelerator: 'CmdOrCtrl+Q', click: function() {app.quit();}}]
        },
        {
            label: '&View',
            submenu: [
                {
                    label: '&Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    }
                },
                {
                    label: 'Toggle &Full Screen',
                    accelerator: process.platform == 'darwin' ? 'Ctrl+Command+F' : 'F11',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    }
                },
                {
                    label: 'Toggle &Developer Tools',
                    accelerator: process.platform == 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    }
                },
            ]
        }
    ];

    if (process.platform == 'darwin') {
        template.unshift({
            label: 'Electron',
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function() { app.quit(); }
                },
            ]
        });
    }

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});
