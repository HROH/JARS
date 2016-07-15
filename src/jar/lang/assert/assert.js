JAR.module('jar.lang.assert', ['Type']).$import('System::isNil').$export(function(isNil) {
    'use strict';

    function assert(value, message, options) {
        var ErrorClass;

        options = options || {};

        ErrorClass = options.error || Error;

        if (!value) {
            throw new ErrorClass(message);
        }
    }

    assert.isNotNil = function(val, message) {
        assert(!isNil(val), message, {
            error: TypeError
        });
    };

    return assert;
});
