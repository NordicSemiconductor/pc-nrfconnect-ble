/*
 * Spawns a child process. The process can be either a node process (if
 * the command is 'node'), or a script/binary from the top-level
 * node_modules/.bin directory of the project.
 *
 * Usage:
 * const spawn = require('./spawn');
 * spawn('command', [arg1, arg2], env, forwardExitCode);
 *
 * Examples:
 * spawn('node', ['path/to/script.js']);
 * spawn('webpack', ['--config', 'path/to/config.js']);
 *
 * By default, the exit code from the child process is forwarded and
 * returned. This behavior can be overridden by passing forwardExitCode
 * false.
 */

const path = require('path');
const spawn = require('child_process').spawn;

const BIN_PATH = ['..', '..', 'node_modules', '.bin'].join(path.sep);

function _createEnv(envVars) {
    const env = Object.create(process.env);
    Object.keys(envVars).forEach(function (key) {
        env[key] = envVars[key];
    });
    return env;
}

function _createCommandWithPath(command) {
    if (command === 'node') {
        return command;
    }
    return BIN_PATH + path.sep + command;
}

module.exports = function(command, args, env, forwardExitCode) {
    const commandWithPath = _createCommandWithPath(command);
    const options = {
        env: env ? _createEnv(env) : process.env,
        shell: true,
        stdio: 'inherit'
    };

    console.log('Running ' + commandWithPath + ' ' + args.join(' '));

    spawn(commandWithPath, args, options).on('exit', function (code) {
        if (forwardExitCode !== false) {
            process.exit(code);
        }
    });
};
