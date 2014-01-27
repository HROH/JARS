JAR.register({
    MID: 'jar.lang.Array.Array-manipulate',
    deps: ['System', '..', '.!search']
}, function(System, lang) {
    'use strict';

    var ArrayCopy = this,
        forEach = ArrayCopy.forEach;

    lang.extendNativeType('Array', {
        merge: function(array) {
            if (System.isArrayLike(array)) {
                this.push.apply(this, array);
            }

            return this;
        },

        mergeUnique: function(array) {
            var arr = this;

            forEach(array, function(item) {
                if (!ArrayCopy.contains(arr, item)) {
                    arr.push(item);
                }
            });

            return this;
        },

        removeAll: function(array) {
            var arr = this;

            forEach(array, function(item) {
                var index;

                while ((index = ArrayCopy.indexOf(arr, item)) != -1) {
                    arr.splice(index, 1);
                }
            });

            return this;
        }
    });

    return {
        merge: ArrayCopy.merge,

        mergeUnique: ArrayCopy.mergeUnique,

        removeAll: ArrayCopy.removeAll
    };
});