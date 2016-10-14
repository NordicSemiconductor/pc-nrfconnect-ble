const path = require('path');
const spawn = require('child_process').spawn;

const serverCommand = 'node ../../server.js';
const electronCommand = ['..', '..', 'node_modules', '.bin', 'electron .'].join(path.sep);

// We have only one hot-reloading development server process. When starting the
// loader, then that occupies the development server while any appmodule that is
// opened by the loader has to be served from pre-bundled code in dist/. Using
// separate env variables to achieve this, ref. script tag in index.html files.
const env = Object.create(process.env);
if (process.argv[2] === '--loader') {
    env.LOADER_ENV = 'development';
} else {
    env.NODE_ENV = 'development';
}
const options = {env: env, shell: true, stdio: 'inherit'};

console.log('Running ' + serverCommand);
console.log('Running ' + electronCommand);
spawn(serverCommand, options);
spawn(electronCommand, options);
