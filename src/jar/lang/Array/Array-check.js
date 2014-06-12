JAR.register({
    MID: 'jar.lang.Array.Array-check',
    deps: ['..', '..Object!derive']
}, function(lang, Obj) {
    'use strict';

    var ArrayCopy = this;

    lang.extendNativeType('Array', {
        every: createCheck(false),

        some: createCheck(true)
    });

    function createCheck(expectedResultForBreak) {
        var methodName = expectedResultForBreak ? 'some' : 'every';

        return function(callback, context) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0,
                result;

            lang.throwErrorIfNotSet('Array', arr, methodName);

            lang.throwErrorIfNoFunction(callback);

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