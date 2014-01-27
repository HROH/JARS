JAR.register({
    MID: 'jar.lang.Array',
    deps: 'System'
}, function(System) {
    'use strict';

    var lang = this,
        ArrayCopy;

    /**
     * Extend jar.lang.Array with some useful methods
     * If a native implementation exists it will be used instead
     */
    ArrayCopy = lang.extendNativeType('Array', {
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
        },

        // add some sugar (example: jar.lang.Array.push(arrayLike, value1, value2, ...) )
        concat: true,

        join: true,

        pop: true,

        push: true,

        reverse: true,

        shift: true,

        slice: true,

        sort: true,

        splice: true,

        unshift: true
    }, {
        from: fromArray,

        fromNative: fromArray,

        fromArguments: fromArray,

        fromArrayLike: fromArray
    });

    function fromArray(array, offset) {
        var arrLen, value;

        if (!(System.isA(array, ArrayCopy))) {
            if (System.isArrayLike(array)) {
                arrLen = array.length;

                if (arrLen > 1) {
                    array = ArrayCopy.apply(ArrayCopy, array);
                }
                else {
                    value = array[0];

                    array = new ArrayCopy();
                    arrLen && array.push(value);
                }
            }
        }

        return System.isNumber(offset) ? array.slice(offset) : array;
    }

    return ArrayCopy;
});