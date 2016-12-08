/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

var fs = require('fs');
var remote = require('electron').remote;
var appPath = remote.getGlobal('appPath');
// var compileLess = require('./js/utils/compileLess.js');
var path = require('path');


//compile less and then insert css/styles.css
function insertStyles(cssPath) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', cssPath);
    document.querySelector('head').appendChild(link);
}

function insertAdditionalCSS(dir) {
    insertStyles(path.join(dir, 'styles.css'));
    insertStyles(path.join(dir, 'resizer.css'));
    insertStyles(path.join(dir, 'react-bootstrap-table-all.min.css'));
}


//TODO Make nrfconnect-appmodule-mesh a dynamic name
var stylesCssPath = path.join(appPath, 'packages', 'nrfconnect-appmodule-mesh',  'css', 'styles.css');
var compileLess = require(path.join(appPath, 'packages', 'nrfconnect-appmodule-mesh',  'js', 'utils', 'compileLess.js'));

fs.stat(stylesCssPath, function (err, stats) {
    if (err || process.env.NODE_ENV !== 'production') {
        compileLess('css/styles.less', 'css/styles.css', function (err) {
            if (err) {
                console.error('Error compiling LESS: ' + err);
            } else {
                console.debug('Successfully compiled LESS');
            }

            insertAdditionalCSS('css');
        });
    } else {
        if (stats.isFile()) {
            // css is pre compiled -> production
            insertAdditionalCSS(path.join(appPath, 'css'));
        } else {
            console.error('Found css file but it is not a file');
        }
    }
});
