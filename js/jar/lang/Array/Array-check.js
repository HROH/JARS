JAR.register({
    MID: 'jar.lang.Array.Array-check',
    deps: '..'
}, function(lang) {
    'use strict';
    
    var ArrayCopy = this;

    lang.extendNativeType('Array', {
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

        some: function(callback, context) {
            var arr = this,
                len = arr.length >>> 0,
                idx = 0;

            lang.throwErrorIfNotSet('Array', arr, 'some');

            lang.throwErrorIfNoFunction(callback);

            for (; idx < len; idx++) {
                if (idx in arr && callback.call(context, arr[idx], idx, arr)) {
                    return true;
                }
            }

            return false;
        }
    });

    return {
		every: ArrayCopy.every,
		
		some: ArrayCopy.some
    };
});