/*
 * Removes the node_modules and dist directories for a package.
 *
 * Example usage in package.json:
 * "scripts": {
 *   "clean": "node ../../scripts/clean.js"
 * }
 */

const spawn = require('./spawn');

spawn('rimraf', ['node_modules']);
spawn('rimraf', ['dist']);
