var path = require('path');
var config = require('../../webpack.config.production');

config.output = {
    path: path.resolve('dist'),
    publicPath: './dist/',
    filename: 'nrfconnect-core.js',
    library: 'nrfconnect-core',
    libraryTarget: 'umd',
    umdNameDefine: true
};

module.exports = config;
