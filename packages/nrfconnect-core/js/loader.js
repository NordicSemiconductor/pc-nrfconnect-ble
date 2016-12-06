const m = require('module');
const originalLoad = m._load;

const packageConfig = require('../package.json');
const peerDeps = packageConfig.peerDependencies;

/**
 We need to ensure that the users copy of peer dependencies are used, and not this
 libraries own local copy (React component tests will fail as it doesn't like it
 when multiple copies are loaded at once). To fix this we'll do some patching of
 the Node module loader.

 https://www.sharpoblunto.com/News/2016/01/25/testing-react-component-libraries-using-npm-link
 */
if (peerDeps) {
    m._load = function (request, parent, isMain) {
        if (peerDeps[request]) {
            const parents = [];
            while (parent) {
                parents.push(parent);
                parent = parent.parent;
            }
            // reverse the usual node module resolution. Instead
            // of trying to load a local copy of the module and
            // going up until we find one, we will try to resolve
            // from the top down, this way peerDeps are preferentially
            // loaded from the parent instead.
            parent = parents.pop();
            while (parent) {
                try {
                    return originalLoad(request, parent, isMain);
                }
                catch (ex) {
                    parent = parents.pop();
                }
            }
        } else {
            return originalLoad(request, parent, isMain);
        }
    }
}
//Now export the library components
module.exports = require('../dist/nrfconnect-core.js');
m._load = originalLoad;
