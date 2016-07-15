JAR.module('jar.lang.Array', [
    'Array-check',
    'Array-derive',
    'Array-find',
    'Array-index',
    'Array-iterate',
    'Array-manipulate',
    'Array-reduce'
]).$import({
    '.assert': [
        '::isNotNil',
        'Type::isFunction'
    ]
}).$export(function(assertIsNotNil, assertIsFunction) {
    'use strict';

    /**
     * Extend jar.lang.Array with some useful methods
     * If a native implementation exists it will be used instead
     */
    var MSG_REQUIRES_ARRAYLIKE = 'Array.from requires an array-like object - not null or undefined',
        MSG_NO_FUNCTION = 'Array.from: when provided, the second argument must be a function',
        Arr = this.sandboxNativeType('Array');

    Arr.enhance({
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

    function fromArray(arrayLike, mapFn, context) {
        var index = 0,
            newArray, len;

        assertIsNotNil(arrayLike, MSG_REQUIRES_ARRAYLIKE);

        mapFn && assertIsFunction(mapFn, MSG_NO_FUNCTION);

        len = arrayLike.length >>> 0;

        newArray = Arr(len);

        while (index < len) {
            newArray[index] = mapFn ? mapFn.call(context, arrayLike[index], index) : arrayLike[index];

            index++;
        }

        return newArray;
    }

    return Arr;
});
