const os = require('os');
const path = require('path')

const BASE_DIR = path.resolve('.')
const EXECUTABLE_DIR = path.join(BASE_DIR, 'bin')

function getExecutableSuffix() {
    switch (os.platform()) {
        case 'darwin':
            // OS X
            return '-osx'
        case 'linux':
            return '-linux'
        case 'win32':
            // Windows
            return '.exe'
        default:
            console.log(`[ERROR]\tUnhandled platform in getExecutableSuffix: ${os.platform()}`)
    }
}

function getExecutablePath(filename) {
    console.log(path.join(EXECUTABLE_DIR, `${filename}${getExecutableSuffix()}`));
    return path.join(EXECUTABLE_DIR, `${filename}${getExecutableSuffix()}`)
    
} 

function getHexPath(filename) {
    return path.join(EXECUTABLE_DIR, `${filename}.hex`)
} 

exports.getExecutableSuffix = getExecutableSuffix;
exports.getExecutablePath = getExecutablePath;
exports.getHexPath = getHexPath;
