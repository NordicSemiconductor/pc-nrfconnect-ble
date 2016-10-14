const path = require('path');
const spawn = require('child_process').spawn;

const command = ['..', '..', 'node_modules', '.bin', 'jest js'].join(path.sep);

const env = Object.create(process.env);
env.BABEL_DISABLE_CACHE = 1;

console.log('Running ' + command);
spawn(command, {
    env: env,
    shell: true,
    stdio: 'inherit'
}).on('exit', function (code) {
    process.exit(code);
});
