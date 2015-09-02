
var less = require('less');
var fs = require('fs');

module.exports = function compileLess(sourceFile, targetFile, callback) {
    fs.readFile(sourceFile, function(err1, data) {
        if (err1) return callback(err1);
        less.render(data.toString(), function (err2, output) {
            if (err2) return callback(err2);
            fs.writeFile(targetFile, output.css, function(err3) {
                return callback(err3);
            });
        });
    });
}