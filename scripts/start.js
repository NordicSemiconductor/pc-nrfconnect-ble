const spawn = require('./spawn');

// We have only one hot-reloading development server process. When starting the
// loader, then that occupies the development server while any appmodule that is
// opened by the loader has to be served from pre-bundled code in dist/. Using
// separate env variables to achieve this, ref. script tag in index.html files.
const env = {};
if (process.argv[2] === '--loader') {
    env.LOADER_ENV = 'development';
} else {
    env.NODE_ENV = 'development';
}

spawn('node', ['../../scripts/server.js'], env);
spawn('electron', ['.'], env, false);
