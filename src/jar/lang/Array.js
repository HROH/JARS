JAR.register({
    MID: 'jar.lang.Array',
    deps: {
        '.assert': ['::isSet', 'Type::isFunction']
    },
    bundle: ['Array-check', 'Array-derive', 'Array-find', 'Array-index', 'Array-iterate', 'Array-manipulate', 'Array-reduce']
}, function(assertIsSet, assertIsFunction) {
    'use strict';

    /**
     * Extend jar.lang.Array with some useful methods
     * If a native implementation exists it will be used instead
     */
    var ArrayCopy = this.extendNativeType('Array', {
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

        assertIsSet(arrayLike, 'Array.from requires an array-like object - not null or undefined');

        if (mapFn) {
            assertIsFunction(mapFn, 'Array.from: when provided, the second argument must be a function');
        }

        len = arrayLike.length >>> 0;

        newArray = ArrayCopy(len);

        while (index < len) {
            newArray[index] = mapFn ? mapFn.call(context, arrayLike[index], index) : arrayLike[index];

            index++;
        }

        return newArray;
    }

    return ArrayCopy;
});