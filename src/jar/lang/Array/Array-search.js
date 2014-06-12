JAR.register({
    MID: 'jar.lang.Array.Array-search',
    deps: ['System', '..']
}, function(System, lang) {
    'use strict';

    var ArrayCopy = this;

    lang.extendNativeType('Array', {
        contains: function(searchElement, fromIndex) {
            return ArrayCopy.indexOf(this, searchElement, fromIndex) !== -1;
        },

        find: createFinder(),

        findIndex: createFinder(true),

        indexOf: function(searchElement, fromIndex) {
            var arr = this,
                len = arr.length >>> 0,
                ret = -1,
                idx;

            lang.throwErrorIfNotSet('Array', arr, 'indexOf');

            if (len > 0) {
                idx = getFromIndex(fromIndex, 0, len);

                for (; idx < len; idx++) {
                    if (arr[idx] === searchElement) {
                        ret = idx;
                        break;
                    }
                }
            }

            return ret;
        },

        lastIndexOf: function(searchElement, fromIndex) {
            var arr = this,
                len = arr.length >>> 0,
                ret = -1,
                idx;

            lang.throwErrorIfNotSet('Array', arr, 'lastIndexOf');

            if (len > 0) {
                idx = getFromIndex(fromIndex, len - 1, len);

                for (; idx > 0; idx--) {
                    if (arr[idx] === searchElement) {
                        ret = idx;
                        break;
                    }
                }
            }

            return ret;
        }
    });

    function createFinder(returnIndex) {
        var methodName = 'find' + returnIndex ? 'Index' : '',
            defaultReturn = returnIndex ? -1 : undefined;

        return function finder(predicate, context) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0,
                ret = defaultReturn;

            lang.throwErrorIfNotSet('Array', arr, methodName);

            lang.throwErrorIfNoFunction(predicate);

            for (; idx < len; idx++) {
                if (idx in arr) {
                    if (predicate.call(context, arr[idx], idx, arr)) {
                        ret = returnIndex ? idx : arr[idx];

                        break;
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
        contains: ArrayCopy.contains,

        find: ArrayCopy.find,

        findIndex: ArrayCopy.findIndex,

        indexOf: ArrayCopy.indexOf,

        lastIndexOf: ArrayCopy.lastIndexOf
    };
});