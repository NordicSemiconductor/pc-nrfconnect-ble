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

var app = require('app');
var BrowserWindow = require('browser-window');
var Menu = require('menu');

var splashScreen = null;
var mainWindow = null;

global.keymap = app.getPath('userData') + '/keymap.cson';
global.logFileDir = app.getPath('userData');

const dialog = require('electron').dialog;
var ipcMain = require('ipc-main');

ipcMain.on('save-server-setup', function(event, arg) {
    event.sender.send('save-server-setup-reply', dialog.showSaveDialog());
});

ipcMain.on('load-server-setup', function(event, arg) {
    event.sender.send('load-server-setup-reply', dialog.showOpenDialog({ properties: ['openFile']}));
});

app.on('window-all-closed', function() {
    app.quit();
});

app.on('ready', function() {
    splashScreen = new BrowserWindow({
        width: 420,
        height: 250,
        frame: false,
        'always-on-top': true,
        'skip-taskbar': true,
    });
    splashScreen.loadURL('file://' + __dirname + '/splashScreen.html');
    splashScreen.on('closed', function() {
        splashScreen = null;
    });

    mainWindow = new BrowserWindow({
        width: 1024,
        height: 800,
        //'min-width': 703,
        'min-width': 308,
        'min-height': 499,
        frame: true,
        icon: './nordic_logo.png',
        'auto-hide-menu-bar': true,
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.on('closed', function() {
        console.log('windows closed');
        mainWindow = null;
        if (splashScreen) {
            splashScreen.close();
        }
    });

    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.setTitle('Yggdrasil');
        if (splashScreen) {
           splashScreen.close();
        }
    });
});

// Create menu.
app.once('ready', function() {
    var template = [
        {
            label: '&File',
            submenu: [
                {
                    label: '&Log file...',
                    enabled: false,
                    /*accelerator: 'CmdOrCtrl+L',*/
                    click: function() {
                        open(global.logFileDir + '\\log.txt');
                    },
                },
                {type: 'separator'},
                {
                    label: '&Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function() {
                        app.quit();
                    },
                },
            ],
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
                    },
                },
                {
                    label: 'Toggle &Full Screen',
                    accelerator: process.platform == 'darwin' ? 'Ctrl+Command+F' : 'F11',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    },
                },
                {
                    label: 'Toggle &Developer Tools',
                    accelerator: process.platform == 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: function(item, focusedWindow) {
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
                    click: function() {
                        app.quit();
                    },
                },
            ],
        });
    }

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});
