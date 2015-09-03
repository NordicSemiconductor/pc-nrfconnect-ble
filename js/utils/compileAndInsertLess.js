
var compileLess = require("./js/utils/compileLess.js");

DEBUG = true;
//compile less and then insert css/styles.css
function insertStyles() {
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", "css/styles.css");
    document.querySelector("head").appendChild(link);
}
if (!DEBUG) {
    insertStyles();
} else {
    compileLess("css/styles.less", "css/styles.css", function(err) {
        if (err) console.error("Error compiling LESS: " + err);
        else console.debug("Successfully compiled LESS");
        insertStyles();
    });
}