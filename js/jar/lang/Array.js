JAR.register({
    MID: 'jar.lang.Array',
    deps: ['..', 'System', '.Object']
}, function(jar, System, Obj) {
    var lang = this,
        TE = TypeError,
        ArrayCopy = jar.getConfig('allowProtoOverwrite') ? Array : lang.sandbox('Array', '__SYSTEM__'),
        ArrayCopyProto,
        isArrayLike = System.isArrayLike;

    ArrayCopyProto = {
        indexOf: function(searchElement, fromIndex) {
            var arr = this,
                len = arr.length >>> 0,
                ret = -1,
                idx;

            throwErrorIfNotSet(arr);

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

            throwErrorIfNotSet(arr);

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

        every: function(callback, arrScope) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0;

            throwErrorIfNotSet(arr);

            throwErrorIfNoFunction(callback);

            for (; idx < len; idx++) {
                if (idx in arr && !callback.call(arrScope, arr[idx], idx, arr)) {
                    return false;
                }
            }

            return true;
        },

        some: function(callback, arrScope) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0;

            throwErrorIfNotSet(arr);

            throwErrorIfNoFunction(callback);

            for (; idx < len; idx++) {
                if (idx in arr && callback.call(arrScope, arr[idx], idx, arr)) {
                    return true;
                }
            }

            return false;
        },

        forEach: function(callback, arrScope) {
            var arr = this,
                idx = 0,
                len = arr.length >>> 0;

            throwErrorIfNotSet(arr);

            throwErrorIfNoFunction(callback);

            while (idx < len) {
                callback.call(arrScope, arr[idx], idx, arr);
                idx++;
            }
        },

        each: function(callback, array) {
            ArrayCopy.forEach(this, callback, array);
        },

        filter: function(callback, arrScope) {
            var arr = this,
                ret = new ArrayCopy();

            throwErrorIfNotSet(arr);

            throwErrorIfNoFunction(callback);

            ArrayCopy.each(arr, function(item, idx) {
                if (callback.call(arrScope, item, idx, arr)) {
                    ret.push(item);
                }
            });

            return ret;
        },

        reduce: function(callback, initialValue) {
            var arr = this,
                len = arr.length >>> 0,
                isValueSet = false,
                idx = 0,
                ret;

            throwErrorIfNotSet(arr);

            throwErrorIfNoFunction(callback);

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

            throwErrorIfNoValueSet(isValueSet);

            return ret;
        },

        reduceRight: function(callback, initialValue) {
            var arr = this,
                len = arr.length >>> 0,
                isValueSet = false,
                idx = len - 1,
                ret;

            throwErrorIfNotSet(arr);

            throwErrorIfNoFunction(callback);

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

            throwErrorIfNoValueSet(isValueSet);

            return ret;
        },

        map: function(callback, arrScope) {
            var arr = this,
                ret = new ArrayCopy();

            throwErrorIfNotSet(arr);

            throwErrorIfNoFunction(callback);

            ArrayCopy.each(arr, function(item, idx) {
                ret.push(callback.call(arrScope, item, idx, arr));
            });

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

            ArrayCopy.each(array, function(item) {
                if (arr.indexOf(item) === -1) {
                    arr.push(item);
                }
            });

            return this;
        },

        removeAll: function(array) {
            var arr = this;

            ArrayCopy.each(array, function(item) {
                var index = arr.indexOf(item);

                if (index != -1) {
                    arr.splice(index, 1);
                }
            });

            return this;
        }
    };

    /**
     * Extend jar.lang.Array with some useful methods
     * If a native implementation exists it will be used instead
     */
    ArrayCopy.prototype.extend(ArrayCopyProto);

    ArrayCopy.extend({
        from: fromArray,
        
        fromNative: fromArray,

        fromArguments: fromArray,

        fromArrayLike: fromArray,

        inArray: function(needle, hayStack) {
            if (isArrayLike(hayStack)) {
                return this.indexOf(hayStack, needle);
            }

            return -1;
        }
    });

    Obj.each(ArrayCopyProto, function(method, methodName) {
        lang.delegate(ArrayCopy.prototype, ArrayCopy, methodName, isArrayLike);
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

    function throwErrorIfNotSet(obj) {
        if (!System.isSet(obj)) {
            throw new TE('Array.prototype.reduce called on null or undefined');
        }
    }

    function throwErrorIfNoFunction(callback) {
        if (!System.isFunction(callback)) {
            throw new TE(callback + ' is not a function');
        }
    }

    function throwErrorIfNoValueSet(isValueSet) {
        if (!isValueSet) {
            throw new TE('Reduce of empty array with no initial value');
        }
    }

    return ArrayCopy;
});