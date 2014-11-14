JAR.register({
    MID: 'jar.lang.assert',
    deps: 'System',
    bundle: ['Type']
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

    assert.isSet = function(val, message) {
        assert(System.isSet(val), message, {
            error: TypeError
        });
    };

    return assert;
});