const fs = require('fs');
const remote = require('electron').remote;

const APP_PATH = getAppPath();

// Get appPath global variable either through electron remote (if
// running in browser), or directly if we are in the main process.
function getAppPath() {
    if (remote) {
        return remote.getGlobal('appPath');
    }
    return global.appPath;
}

function getAppmoduleDirectories() {
    const packageJson = require('../../package.json');
    return packageJson.appmodules;
}

function getAppmodules() {
    const appmoduleDirectories = getAppmoduleDirectories();
    return appmoduleDirectories.map(directory => {
        const contents = fs.readFileSync(`${APP_PATH}/node_modules/${directory}/package.json`);
        return createAppmoduleConfig(JSON.parse(contents));
    });
}

function createAppmoduleConfig(packageJson) {
    return {
        name: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
        author: packageJson.author,
        title: packageJson.config.title,
        icon: `${APP_PATH}/node_modules/${packageJson.name}/${packageJson.config.icon}`,
    };
}

module.exports = {
    getAppmoduleDirectories,
    getAppmodules,
};
