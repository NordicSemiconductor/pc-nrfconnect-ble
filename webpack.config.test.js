const config = require('./webpack.config.development');
module.exports = {
    module: config.module,
    resolve: config.resolve
};
