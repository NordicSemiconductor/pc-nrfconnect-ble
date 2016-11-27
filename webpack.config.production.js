var webpack = require('webpack');
var config = require('./webpack.config.development.js');

config.entry.shift();
config.plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),
];
config.output.publicPath = './dist/';

module.exports = config;