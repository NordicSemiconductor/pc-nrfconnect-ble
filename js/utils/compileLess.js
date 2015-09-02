
var less = require('less');
var fs = require('fs');

module.exports = function compileLess(sourceFile, targetFile) {
	function printError(err) { 
		if (err) console.error("Error compiling LESS: " + err);
	}
	fs.readFile(sourceFile, function(err1, data) {
    	printError(err1);
	    less.render(data.toString(), function (err2, output) {
    		printError(err2);
	        fs.writeFile(targetFile, output.css, function(err3) {
	        	printError(err3);
	        	if (!err1 && !err2 && !err3) console.debug("Successfully compiled LESS");
	        });
	    });
	});
}