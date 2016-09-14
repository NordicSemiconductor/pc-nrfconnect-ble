var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

// Add all node modules as externals, but keep the require behavior.
// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

var config = {
    devtool: 'source-map',
    entry: [
        'webpack-hot-middleware/client?path=http://localhost:9000/__webpack_hmr',
        './js/index',
    ],
    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            loader: 'babel-loader?cacheDirectory',
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.less$/,
            loader: "style!css!less"
        }, {
            test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            loader: 'file'
        }]

    },
    output: {
        path: __dirname + '/dist',
        publicPath: 'http://localhost:9000/dist/',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json']
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    externals: nodeModules
};

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
