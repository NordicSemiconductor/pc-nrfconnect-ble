var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

// Add all node modules as externals, but keep the require behavior.
// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
function createExternals(moduleDirectories) {
    var externals = {};
    moduleDirectories.forEach(function (directory) {
        fs.readdirSync(directory)
            .filter(function(x) {
                return ['.bin'].indexOf(x) === -1;
            })
            .forEach(function(mod) {
                externals[mod] = 'commonjs ' + mod;
            });
    });
    return externals;
}

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
            loader: 'json-loader'
        }, {
            test: /\.less$/,
            loader: "style-loader!css-loader!less-loader"
        }, {
            test: /\.(png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            loader: 'file-loader'
        }]

    },
    output: {
        path: path.resolve('dist'),
        publicPath: 'http://localhost:9000/dist/',
        filename: 'bundle.js'
    },
    resolve: {
        resolve: { root: path.resolve("./node_modules") },
        extensions: ['', '.js', '.jsx', '.json']
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    externals: createExternals([
        'node_modules',
        __dirname + '/node_modules'
    ])
};

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
