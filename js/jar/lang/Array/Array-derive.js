JAR.register({
    MID: 'jar.lang.Array.Array-derive',
    deps: '..'
}, function(lang) {
    'use strict';
	
	var ArrayCopy = this,
		forEach = ArrayCopy.forEach;
	
    lang.extendNativeType('Array', {
        filter: function(callback, context) {
            var arr = this,
                ret = new ArrayCopy();

            lang.throwErrorIfNotSet('Array', arr, 'filter');

            lang.throwErrorIfNoFunction(callback);

            forEach(arr, function(item, idx) {
                if (callback.call(context, item, idx, arr)) {
                    ret.push(item);
                }
            });

            return ret;
        },

        map: function(callback, context) {
            var arr = this,
                ret = new ArrayCopy();

            lang.throwErrorIfNotSet('Array', arr, 'map');

            lang.throwErrorIfNoFunction(callback);

            forEach(arr, function(item, idx) {
                ret.push(callback.call(context, item, idx, arr));
            });

            return ret;
        }
    });

    return {
		filter: ArrayCopy.filter,
		
		map: ArrayCopy.map
    };
});