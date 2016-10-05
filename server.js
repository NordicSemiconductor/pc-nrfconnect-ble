let express = require('express');
let webpack = require('webpack');
let webpackDevMiddleware = require('webpack-dev-middleware');
let webpackHotMiddleware = require('webpack-hot-middleware');
let config = require('./webpack.config.development');
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
