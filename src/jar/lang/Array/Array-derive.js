JAR.module('jar.lang.Array.Array-derive').$import([
    {
        '..assert': [
            '::isNotNil',
            'Type::isFunction'
        ]
    },
    '.!iterate',
    '..Object!derive'
]).$export(function(assertIsNotNil, assertIsFunction, Arr, Obj) {
    'use strict';

    var forEach = Arr.forEach,
        MSG_NO_FUNCTION = 'The callback is not a function';

    Arr.enhance({
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

            assertIsNotNil(arr, assertionMessage);

            assertIsFunction(callback, MSG_NO_FUNCTION);

            forEach(arr, derive(context, callback, ret));

            return ret;
        }

        return deriver;
    }

    return Obj.extract(Arr, ['filter', 'map']);
});
