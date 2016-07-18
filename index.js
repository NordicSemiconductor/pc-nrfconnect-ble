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
var settings = require('./settings');
var os = require('os');
var path = require('path');

var splashScreen = null;
var mainWindow = null;

global.keymap = app.getPath('userData') + '/keymap.cson';
global.userDataDir = app.getPath('userData');

if (os.type() === 'Windows_NT') {
    global.appPath = path.dirname(app.getPath('exe'));
} else {
    global.appPath = app.getAppPath();
}

global.colors = undefined;

settings.loadColorScheme((error, colors) => {
    if (error) {
        console.log('Error loading colorscheme: ' + error);
        return;
    }

    global.colors = colors;
});

const dialog = require('electron').dialog;
var ipcMain = require('ipc-main');

var filters =  [{ name: 'nRF Connect Server Setup', extensions: ['ncs', 'json'] },
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

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
    splashScreen = new BrowserWindow({
        width: 400,
        height: 223,
        frame: false,
        'always-on-top': true,
        'skip-taskbar': true,
        resizable: false,
        show: false,
        transparent: true,
        icon: __dirname + '/nrfconnect.png',
    });

    splashScreen.loadURL('file://' + __dirname + '/splashScreen.html');
    splashScreen.on('closed', function () {
        splashScreen = null;
    });

    splashScreen.show();

    const lastWindowState = settings.loadLastWindow();

    mainWindow = new BrowserWindow({
        x: lastWindowState.x,
        y: lastWindowState.y,
        width: lastWindowState.width,
        height: lastWindowState.height,
        //'min-width': 703,
        'min-width': 308,
        'min-height': 499,
        frame: true,
        icon: __dirname + '/nrfconnect.png',
        'auto-hide-menu-bar': true,
        show: false,
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('close', function () {
        settings.storeLastWindow(mainWindow);
    });

    mainWindow.on('closed', function () {
        console.log('windows closed');
        mainWindow = null;
        if (splashScreen) {
            splashScreen.close();
        }
    });

    mainWindow.webContents.on('did-finish-load', function () {
        if (splashScreen) {
            splashScreen.close();
        }

        if (lastWindowState.maximized) {
            mainWindow.maximize();
        }

        mainWindow.setTitle('nRF Connect v1.0');
        mainWindow.show();
    });

    mainWindow.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        require('shell').openExternal(url);
    });
});

// Create menu.
app.once('ready', function () {
    var template = [
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

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});
