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

let electron = require('electron');
let core = require('nrfconnect-core/index');

// Support both immediate and delayed initialization
if (electron.app.isReady()) {
    initBrowserWindow();
} else {
    electron.app.on('ready', function () {
        initBrowserWindow();
    });
}

function initBrowserWindow() {
    const packageJson = require('./package.json');
    core.createBrowserWindow({
        title: packageJson.config.title,
        url: 'file://' + __dirname + '/index.html',
        icon: __dirname + '/' + packageJson.config.icon,
        menu: true
    });
}
