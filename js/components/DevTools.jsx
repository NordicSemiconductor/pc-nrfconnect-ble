'use strict';

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./DevTools.prod');
} else {
    module.exports = require('./DevTools.dev');
}
