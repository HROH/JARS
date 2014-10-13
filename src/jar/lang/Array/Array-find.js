JAR.register({
    MID: 'jar.lang.Array.Array-find',
    deps: ['System', '..', '..assert']
}, function(System, lang, assert) {
    'use strict';

    var MSG_NO_FUNCTION = 'The predicate is not a function',
        ArrayCopy;
        
    ArrayCopy = lang.extendNativeType('Array', {
        find: createFinder(),

        findLast: createFinder(false, true),

        findIndex: createFinder(true),

        findLastIndex: createFinder(true, true)
    });

    function createFinder(returnIndex, last) {
        var assertionMessage = 'Array.prototype.find' + (last ? 'Last' : '') + (returnIndex ? 'Index' : '') + ' called on null or undefined',
            defaultReturn = returnIndex ? -1 : undefined;

        return function finder(predicate, context, fromIndex) {
            var arr = this,
                len = arr.length >>> 0,
                ret = defaultReturn,
                idx;

            assert.isSet(arr, assertionMessage);

            assert.isFunction(predicate, MSG_NO_FUNCTION);

            if (len > 0) {
                idx = getFromIndex(fromIndex, last ? len - 1 : 0, len);

                for (; last ? idx > 0 : idx < len; last ? idx-- : idx++) {
                    if (idx in arr) {
                        if (predicate.call(context, arr[idx], idx, arr)) {
                            ret = returnIndex ? idx : arr[idx];

                            break;
                        }
                    }
                }
            }

            return ret;
        };
    }

    function getFromIndex(fromIndex, defaultIndex, len) {
        var idx = Number(fromIndex),
            absIdx;

        if (!System.isNumber(idx)) {
            idx = defaultIndex;
        }
        else if (idx !== 0) {
            absIdx = Math.floor(Math.abs(idx));
            idx = idx > 0 ? absIdx : len - absIdx;
        }

        return idx;
    }

    return {
        find: ArrayCopy.find,

        findLast: ArrayCopy.findLast,

        findIndex: ArrayCopy.findIndex,

        findLastIndex: ArrayCopy.findLastIndex
    };
});