JAR.register({
    MID: 'jar.lang.Array.Array-reduce',
    deps: '..'
}, function(lang) {
    'use strict';
    
    var ArrayCopy = this;

    lang.extendNativeType('Array', {
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
                if (idx  in arr) {
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
                if (idx in arr) {
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
        }
    });

    return {
		reduce: ArrayCopy.reduce,
		
		reduceRight: ArrayCopy.reduceRight
    };
});