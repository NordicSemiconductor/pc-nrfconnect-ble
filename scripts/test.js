/*
 * Runs unit tests with jest. Supports specifying command-line arguments
 * to jest by using the normal npm practice of adding '--' before
 * the arguments.
 *
 * Example usage in package.json:
 * "scripts": {
 *   "test": "node ../../scripts/test.js"
 * }
 *
 * Normal usage from command-line:
 * npm test
 *
 * Watch mode:
 * npm test -- --watch
 *
 * Update snapshots:
 * npm test -- -u
 */

const spawn = require('./spawn');

const sourceDirectory = 'js';
const args = [sourceDirectory].concat(process.argv.slice(2));

spawn('jest', args, { BABEL_DISABLE_CACHE: 1 });
