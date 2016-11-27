/*
 * Uses webpack to bundle all JS modules and assets to the dist directory
 * of the package. Other packages can then import modules from the
 * package. A webpack configuration file has to be given as an argument,
 * usually webpack.config.production.js.
 *
 * Example usage in package.json:
 * "scripts": {
 *   "build": "node ../../scripts/build.js <webpack-config-file>"
 * }
 */

const spawn = require('./spawn');

const configFile = process.argv[2];
if (!configFile) {
    console.log('Usage: node build.js <webpack-config-file>');
    process.exit(1);
}

spawn('webpack', ['--config', configFile]);
