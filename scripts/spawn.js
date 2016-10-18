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
