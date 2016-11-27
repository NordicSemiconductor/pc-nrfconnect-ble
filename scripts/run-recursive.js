/*
 * Runs a yarn command for all projects in the packages directory.
 * Usage: node run-recursive.js <yarn-arguments>
 *
 * Example usage in the top-level package.json:
 * "scripts": {
 *   "build": "node scripts/run-recursive.js run build",
 *   "clean": "node scripts/run-recursive.js run clean"
 * }
 */

const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const packagesDir = path.resolve(__dirname, '../packages/');
const args = process.argv.slice(2);

fs.readdirSync(packagesDir).forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);

    console.log();
    console.log('===============================================================');
    console.log('cd packages/' + packageName + ' && yarn ' + args.join(' '));
    console.log('===============================================================');

    const result = spawnSync('yarn', args, { env: process.env, cwd: packagePath, stdio: 'inherit' });
    if (result.status !== 0) {
        process.exit(result.status);
    }
    console.log('===============================================================');
    console.log();
});
