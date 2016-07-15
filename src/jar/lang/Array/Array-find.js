JAR.module('jar.lang.Array.Array-find').$import([
    'System::isNumber',
    {
        '..assert': [
            '::isNotNil',
            'Type::isFunction'
        ]
    }
]).$export(function(isNumber, assertIsNotNil, assertIsFunction) {
    'use strict';

    var MSG_NO_FUNCTION = 'The predicate is not a function',
        Arr = this;

    Arr.enhance({
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

            assertIsNotNil(arr, assertionMessage);

            assertIsFunction(predicate, MSG_NO_FUNCTION);

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

        if (!isNumber(idx)) {
            idx = defaultIndex;
        }
        else if (idx !== 0) {
            absIdx = Math.floor(Math.abs(idx));
            idx = idx > 0 ? absIdx : len - absIdx;
        }

        return idx;
    }

    return {
        find: Arr.find,

        findLast: Arr.findLast,

        findIndex: Arr.findIndex,

        findLastIndex: Arr.findLastIndex
    };
});
