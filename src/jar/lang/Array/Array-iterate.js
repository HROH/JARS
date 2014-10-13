JAR.register({
    MID: 'jar.lang.Array.Array-iterate',
    deps: ['..', '..assert']
}, function(lang, assert) {
    'use strict';

    var ArrayCopy = this,
        MSG_NO_FUNCTION = 'The callback is not a function',
        assertionMessage = 'Array.prototype.forEach called on null or undefined';

    lang.extendNativeType('Array', {
        each: function(callback, array) {
            ArrayCopy.forEach(this, callback, array);
        },

        forEach: function(callback, context) {
            var arr = this,
                idx = 0,
                len = arr.length >>> 0;

            assert.isSet(arr, assertionMessage);

            assert.isFunction(callback, MSG_NO_FUNCTION);

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