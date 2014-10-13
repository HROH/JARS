JAR.register({
    MID: 'jar.lang.assert',
    deps: 'System'
}, function(System) {
    'use strict';

    function assert(value, message, options) {
        var ErrorClass;

        options = options || {};

        ErrorClass = options.error || Error;

        if (!value) {
            throw new ErrorClass(message);
        }
    }

    assert.isFunction = function(fn, message) {
        assert(System.isFunction(fn), message, {
            error: TypeError
        });
    };

    assert.isSet = function(val, message) {
        assert(System.isSet(val), message, {
            error: TypeError
        });
    };

    return assert;
});