JAR.register({
    MID: 'jar.lang.Array.Array-derive',
    deps: ['..', '..assert', '.!iterate', '..Object!derive']
}, function(lang, assert, Arr, Obj) {
    'use strict';

    var forEach = Arr.forEach,
        MSG_NO_FUNCTION = 'The callback is not a function';

    lang.extendNativeType('Array', {
        filter: createDeriver(),

        map: createDeriver(true)
    });

    function createDeriver(isMapper) {
        var assertionMessage = 'Array.prototype.' + (isMapper ? 'map' : 'filter') + ' called on null or undefined';

        function derive(context, callback, ret) {
            return isMapper ? function mapDeriver(item, idx, arr) {
                ret.push(callback.call(context, item, idx, arr));
            } : function filterDeriver(item, idx, arr) {
                if (callback.call(context, item, idx, arr)) {
                    ret.push(item);
                }
            };
        }

        function deriver(callback, context) {
            /*jslint validthis: true */
            var arr = this,
                ret = new Arr();

            assert.isSet(arr, assertionMessage);

            assert.isFunction(callback, MSG_NO_FUNCTION);

            forEach(arr, derive(context, callback, ret));

            return ret;
        }

        return deriver;
    }

    return Obj.extract(Arr, ['filter', 'map']);
});