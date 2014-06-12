JAR.register({
    MID: 'jar.lang.Array.Array-iterate',
    deps: '..'
}, function(lang) {
    'use strict';

    var ArrayCopy = this;

    lang.extendNativeType('Array', {
        each: function(callback, array) {
            ArrayCopy.forEach(this, callback, array);
        },

        forEach: function(callback, context) {
            var arr = this,
                idx = 0,
                len = arr.length >>> 0;

            lang.throwErrorIfNotSet('Array', arr, 'forEach');

            lang.throwErrorIfNoFunction(callback);

            while (idx < len) {
                if (idx in arr) {
                    callback.call(context, arr[idx], idx++, arr);
                }
            }
        }
    });

    return {
        each: ArrayCopy.each,
        
        forEach: ArrayCopy.forEach
    };
});