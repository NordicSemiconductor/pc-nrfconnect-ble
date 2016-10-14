const path = require('path');
const spawn = require('child_process').spawn;

const configFile = process.argv[2];
if (!configFile) {
    console.log('Usage: node build.js <webpack-config-file>');
    process.exit(1);
}
const command = ['..', '..', 'node_modules', '.bin', 'webpack --config ' + configFile].join(path.sep);

console.log('Running ' + command);
spawn(command, {
    shell: true,
    stdio: 'inherit'
}).on('exit', function (code) {
    process.exit(code);
});
