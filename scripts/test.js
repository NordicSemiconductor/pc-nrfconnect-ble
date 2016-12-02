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

const args = process.argv.slice(2);

spawn('jest', args);
