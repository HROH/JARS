JAR.register({
    MID: 'jar.lang.Array.Array-reduce',
    deps: '..'
}, function(lang) {
    'use strict';

    var ArrayCopy = this;

    lang.extendNativeType('Array', {
        reduce: createReduce(),

        reduceRight: createReduce(true)
    });

    function createReduce(reduceRight) {
        var methodName = reduceRight ? 'reduceRight' : 'reduce';

        return function(callback, initialValue) {
            var arr = this,
                len = arr.length >>> 0,
                isValueSet = false,
                idx = reduceRight ? len - 1 : 0,
                ret;

            lang.throwErrorIfNotSet('Array', arr, methodName);

            lang.throwErrorIfNoFunction(callback);

            if (arguments.length > 1) {
                ret = initialValue;
                isValueSet = true;
            }

            for (; reduceRight ? idx >= 0 : idx < len; reduceRight ? --idx : ++idx) {
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
        };
    }

    return {
        reduce: ArrayCopy.reduce,

        reduceRight: ArrayCopy.reduceRight
    };
});