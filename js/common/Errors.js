'use strict';


function ValidationError(msg) {
    var err = Error.call(this, msg);
    err.name = "ValidationError";
    return err;
}

ValidationError.prototype = Object.create(Error.prototype, {
    constructor: { value: ValidationError }
});


module.exports = { ValidationError };
