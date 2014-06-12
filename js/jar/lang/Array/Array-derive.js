JAR.register({
    MID: 'jar.lang.Array.Array-derive',
    deps: ['..', '.!iterate', '..Object!derive']
}, function(lang, Arr, Obj) {
    'use strict';
	
	var forEach = Arr.forEach;
	
    lang.extendNativeType('Array', {
        filter: function(callback, context) {
            var arr = this,
                ret = new Arr();

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
                ret = new Arr();

            lang.throwErrorIfNotSet('Array', arr, 'map');

            lang.throwErrorIfNoFunction(callback);

            forEach(arr, function(item, idx) {
                ret.push(callback.call(context, item, idx, arr));
            });

            return ret;
        }
    });

    return Obj.extract(Arr, ['filter', 'map']);
});