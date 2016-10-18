const spawn = require('./spawn');

const configFile = process.argv[2];
if (!configFile) {
    console.log('Usage: node build.js <webpack-config-file>');
    process.exit(1);
}

spawn('webpack', ['--config', configFile]);
