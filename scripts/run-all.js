/*
* Runs an npm command for all projects in the packages directory.
* Usage: node run-all.js <npm-arguments>
*
* Example usage in the top-level package.json:
* "scripts": {
*   "build": "node scripts/run-all.js run build",
*   "clean": "node scripts/run-all.js run clean"
* }
*/

const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const packagesDir = path.resolve(__dirname, '../packages/');
const args = process.argv.slice(2);

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

fs.readdirSync(packagesDir).forEach(packageName => {
   const packagePath = path.join(packagesDir, packageName);

   console.log();
   console.log('===============================================================');
   console.log('cd packages/' + packageName + ' && npm ' + args.join(' '));
   console.log('===============================================================');

   const result = spawnSync(npmCmd, args, { env: process.env, cwd: packagePath, stdio: 'inherit' });
   if (result.status !== 0) {
       process.exit(result.status);
   }
   console.log('===============================================================');
   console.log();
});
