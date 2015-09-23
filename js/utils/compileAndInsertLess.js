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

var fs = require('fs');
var compileLess = require('./js/utils/compileLess.js');

//compile less and then insert css/styles.css
function insertStyles(cssPath) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', cssPath);
    document.querySelector('head').appendChild(link);
}

var stylesCssPath = process.resourcesPath + '/app/css/styles.css';

fs.stat(stylesCssPath, function(err, stats) {
    if (err) {
        compileLess('css/styles.less', 'css/styles.css', function(err) {
            if (err) {
                console.error('Error compiling LESS: ' + err);
            } else {
                console.debug('Successfully compiled LESS');
            }

            insertStyles('css/styles.css');
        });
    } else {
        if (stats.isFile()) {
            insertStyles(stylesCssPath);
        } else {
            console.error('Found css file but it is not a file')
        }
    }
});

