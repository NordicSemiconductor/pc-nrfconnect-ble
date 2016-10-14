const path = require('path');
const spawn = require('child_process').spawn;

const command = ['..', '..', 'node_modules', '.bin', 'rimraf node_modules'].join(path.sep);

console.log('Running ' + command);
spawn(command, {shell: true, stdio: 'inherit'});
