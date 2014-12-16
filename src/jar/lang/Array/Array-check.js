JAR.register({
    MID: 'jar.lang.Array.Array-check',
    deps: [{
        '..assert': ['::isSet', 'Type::isFunction']
    }, '..Object!derive']
}, function(assertIsSet, assertIsFunction, Obj) {
    'use strict';

    var Arr = this,
        MSG_NO_FUNCTION = 'The callback is not a function';

    Arr.enhance({
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

            assertIsSet(arr, assertionMessage);

            assertIsFunction(callback, MSG_NO_FUNCTION);

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

    return Obj.extract(Arr, ['every', 'some']);
});