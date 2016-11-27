/*
 * Starts a webpack development server that does HMR (hot module
 * replacement) when source code is edited. The development server is
 * running on http://localhost:9000.
 *
 * Intended to be started together with an Electron process, which loads
 * the application in development mode. When in development mode, the app
 * should load content from http://localhost:9000 instead of using the
 * filesystem directly.
 */

let express = require('express');
let webpack = require('webpack');
let webpackDevMiddleware = require('webpack-dev-middleware');
let webpackHotMiddleware = require('webpack-hot-middleware');
let config = require('../webpack.config.development');
let net = require('net');
let server = net.createServer();

const PORT = 9000;

function startHotReloadServer() {
    const compiler = webpack(config);
    const app = express();

    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {
            colors: true
        }
    }));

    app.use(webpackHotMiddleware(compiler));

    app.listen(PORT);
}

function ifPortAvailable(port, runFn) {
    server.once('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is in use. Not starting hot-reload server.`);
        }
    });

    server.once('listening', function() {
        server.close();
        runFn();
    });

    server.listen(port);
}

process.on('SIGINT', function () {
    process.exit();
});

ifPortAvailable(PORT, () => startHotReloadServer());
