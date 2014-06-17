JAR.register({
    MID: 'jar.lang.Array.Array-find',
    deps: ['System', '..']
}, function(System, lang) {
    'use strict';

    var ArrayCopy = lang.extendNativeType('Array', {
        find: createFinder(),

        findLast: createFinder(false, true),

        findIndex: createFinder(true),

        findLastIndex: createFinder(true, true)
    });

    function createFinder(returnIndex, last) {
        var methodName = 'find' + (last ? 'Last' : '') + (returnIndex ? 'Index' : ''),
            defaultReturn = returnIndex ? -1 : undefined;

        return function finder(predicate, context, fromIndex) {
            var arr = this,
                len = arr.length >>> 0,
                ret = defaultReturn,
                idx;

            lang.throwErrorIfNotSet('Array', arr, methodName);

            lang.throwErrorIfNoFunction(predicate);

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