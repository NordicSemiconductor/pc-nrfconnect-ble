import fs from 'fs';
import { remote } from 'electron';

const APP_PATH = remote.getGlobal('appPath');

export function getAppmoduleDirectories() {
    const packageJson = require('../../package.json');
    return packageJson.appmodules;
}

export function getAppmodules() {
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
