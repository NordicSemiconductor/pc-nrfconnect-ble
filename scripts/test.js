const spawn = require('./spawn');

spawn('jest', ['js'], { BABEL_DISABLE_CACHE: 1 });
