const spawn = require('./spawn');

spawn('rimraf', ['node_modules']);
spawn('rimraf', ['dist']);
