JAR.register({
    MID: 'jar.lang.Array',
    deps: 'System'
}, function(System) {
    'use strict';

    var lang = this,
        isArrayLike = System.isArrayLike,
        ArrayCopy;

    /**
     * Extend jar.lang.Array with some useful methods
     * If a native implementation exists it will be used instead
     */
    ArrayCopy = lang.extendNativeType('Array', {
        contains: function(searchElement) {
            return lang.callNativeTypeMethod(ArrayCopy, 'indexOf', this, [searchElement]) !== -1;
        },

        each: function(callback, array) {
            callEach(this, [callback, array]);
        },

        every: function(callback, context) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0;

            lang.throwErrorIfNotSet('Array', arr, 'every');

            lang.throwErrorIfNoFunction(callback);

            for (; idx < len; idx++) {
                if (idx in arr && !callback.call(context, arr[idx], idx, arr)) {
                    return false;
                }
            }

            return true;
        },

        filter: function(callback, context) {
            var arr = this,
                ret = new ArrayCopy();

            lang.throwErrorIfNotSet('Array', arr, 'filter');

            lang.throwErrorIfNoFunction(callback);

            callEach(arr, [function(item, idx) {
                if (callback.call(context, item, idx, arr)) {
                    ret.push(item);
                }
            }]);

            return ret;
        },

        find: function() {

        },

        findIndex: function() {

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
        },

        map: function(callback, context) {
            var arr = this,
                ret = new ArrayCopy();

            lang.throwErrorIfNotSet('Array', arr, 'map');

            lang.throwErrorIfNoFunction(callback);

            callEach(arr, [function(item, idx) {
                ret.push(callback.call(context, item, idx, arr));
            }]);

            return ret;
        },

        merge: function(array) {
            if (isArrayLike(array)) {
                this.push.apply(this, array);
            }

            return this;
        },

        mergeUnique: function(array) {
            var arr = this;

            callEach(array, [function(item) {
                if (arr.indexOf(item) === -1) {
                    arr.push(item);
                }
            }]);

            return this;
        },

        reduce: function(callback, initialValue) {
            var arr = this,
                len = arr.length >>> 0,
                isValueSet = false,
                idx = 0,
                ret;

            lang.throwErrorIfNotSet('Array', arr, 'reduce');

            lang.throwErrorIfNoFunction(callback);

            if (arguments.length > 1) {
                ret = initialValue;
                isValueSet = true;
            }

            for (; idx < len; ++idx) {
                if (arr.hasOwnProperty(idx)) {
                    if (isValueSet) {
                        ret = callback(ret, arr[idx], idx, arr);
                    }
                    else {
                        ret = arr[idx];
                        isValueSet = true;
                    }
                }
            }

            lang.throwErrorIfNoValueSet('array', isValueSet);

            return ret;
        },

        reduceRight: function(callback, initialValue) {
            var arr = this,
                len = arr.length >>> 0,
                isValueSet = false,
                idx = len - 1,
                ret;

            lang.throwErrorIfNotSet('Array', arr, 'reduceRight');

            lang.throwErrorIfNoFunction(callback);

            if (arguments.length > 1) {
                ret = initialValue;
                isValueSet = true;
            }

            for (; idx >= 0; --idx) {
                if (arr.hasOwnProperty(idx)) {
                    if (isValueSet) {
                        ret = callback(ret, arr[idx], idx, arr);
                    }
                    else {
                        ret = arr[idx];
                        isValueSet = true;
                    }
                }
            }

            lang.throwErrorIfNoValueSet('array', isValueSet);

            return ret;
        },

        removeAll: function(array) {
            var arr = this;

            callEach(array, [function(item) {
                var index = arr.indexOf(item);

                while (index != -1) {
                    arr.splice(index, 1);
                    index = arr.indexOf(item);
                }
            }]);

            return this;
        },

        some: function(callback, context) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0;

            lang.throwErrorIfNotSet(arr, 'some');

            lang.throwErrorIfNoFunction(callback);

            for (; idx < len; idx++) {
                if (idx in arr && callback.call(context, arr[idx], idx, arr)) {
                    return true;
                }
            }

            return false;
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
            if (isArrayLike(array)) {
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

    function callEach(array, withData) {
        return lang.callNativeTypeMethod(ArrayCopy, 'forEach', array, withData);
    }

    return ArrayCopy;
});