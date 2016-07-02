JAR.module('jar.lang.assert', ['Type']).$import('System::isSet').$export(function(isSet) {
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
        assert(isSet(val), message, {
            error: TypeError
        });
    };

    return assert;
});