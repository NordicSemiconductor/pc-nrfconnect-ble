/*
 * Adds symlinks in node_modules to packages that are defined in the 'links'
 * array in package.json. This is useful during development, when working with
 * local dependencies. NB: Make sure to replace links with real dependencies in
 * package.json before publishing to npm.
 *
 * Usage:
 * cd packages/some-package && node ../../scripts/linkup.js
 *
 * Example package.json:
 * {
 *   ...
 *   "links": [
 *     "nrfconnect-foo",
 *     "nrfconnect-bar"
 *   ]
 *   ...
 * }
 *
 * Will produce symlinks:
 * ./node_modules/nrfconnect-foo -> ../packages/nrfconnect-foo
 * ./node_modules/nrfconnect-bar -> ../packages/nrfconnect-bar
 */

const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const packageJsonFile = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

if (!packageJson.links) {
    return;
}

const packagesDir = path.resolve(__dirname, '../packages/');

packageJson.links.forEach(packageName => {
    const packagePath = path.join(packagesDir, packageName);
    spawnSync('yarn', ['link'], { env: process.env, cwd: packagePath, stdio: 'inherit' });
    spawnSync('yarn', ['link', packageName], { env: process.env, stdio: 'inherit' });
});