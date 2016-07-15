JAR.module('jar.lang.Array.Array-iterate').$import({
    '..assert': [
        '::isNotNil',
        'Type::isFunction'
    ]
}).$export(function(assertIsNotNil, assertIsFunction) {
    'use strict';

    var Arr = this,
        MSG_NO_FUNCTION = 'The callback is not a function',
        assertionMessage = 'Array.prototype.forEach called on null or undefined';

    Arr.enhance({
        each: function(callback, array) {
            Arr.forEach(this, callback, array);
        },

        forEach: function(callback, context) {
            var arr = this,
                idx = 0,
                len = arr.length >>> 0;

            assertIsNotNil(arr, assertionMessage);

            assertIsFunction(callback, MSG_NO_FUNCTION);

            while (idx < len) {
                if (idx in arr) {
                    callback.call(context, arr[idx], idx++, arr);
                }
            }
        }
    });

    return {
        each: Arr.each,

        forEach: Arr.forEach
    };
});
