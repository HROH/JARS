JAR.register({
    MID: 'jar.lang.Array.Array-check',
    deps: ['..', '..assert', '..Object!derive']
}, function(lang, assert, Obj) {
    'use strict';

    var ArrayCopy = this,
        MSG_NO_FUNCTION = 'The callback is not a function';

    lang.extendNativeType('Array', {
        every: createCheck(false),

        some: createCheck(true)
    });

    function createCheck(expectedResultForBreak) {
        var assertionMessage = 'Array.prototype.' + expectedResultForBreak ? 'some' : 'every' + ' called on null or undefined';

        return function(callback, context) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0,
                result;

            assert.isSet(arr, assertionMessage);

            assert.isFunction(callback, MSG_NO_FUNCTION);

            for (; idx < len; idx++) {
                if (idx in arr) {
                    result = !! callback.call(context, arr[idx], idx, arr);

                    if (result === expectedResultForBreak) {
                        return expectedResultForBreak;
                    }
                }
            }

            return !expectedResultForBreak;
        };
    }

    return Obj.extract(ArrayCopy, ['every', 'some']);
});