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

var compileLess = require("./js/utils/compileLess.js");

//compile less and then insert css/styles.css
function insertStyles() {
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", "css/styles.css");
    document.querySelector("head").appendChild(link);
}
if (process.env.NODE_ENV === 'production') {
    insertStyles();
} else {
    compileLess("css/styles.less", "css/styles.css", function(err) {
        if (err) console.error("Error compiling LESS: " + err);
        else console.debug("Successfully compiled LESS");
        insertStyles();
    });
}