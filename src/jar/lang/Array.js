JAR.register({
    MID: 'jar.lang.Array',
    deps: 'System',
    bundle: ['Array-check', 'Array-derive', 'Array-find', 'Array-index', 'Array-iterate', 'Array-manipulate', 'Array-reduce']
}, function(System) {
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

    function fromArray(array, offset) {
        var arrLen, value;

        if (!(System.isA(array, ArrayCopy))) {
            if (System.isArrayLike(array)) {
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

    return ArrayCopy;
});