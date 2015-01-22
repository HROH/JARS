JAR.module('jar.lang.Array.Array-manipulate').$import([
    'System::isArrayLike',
    '.!index,iterate',
    '..Object!derive'
]).$export(function(isArrayLike, Arr, Obj) {
    'use strict';

    var forEach = Arr.forEach;

    Arr.enhance({
        merge: function(array) {
            if (isArrayLike(array)) {
                this.push.apply(this, array);
            }

            return this;
        },

        mergeUnique: function(array) {
            var arr = this;

            forEach(array, function(item) {
                if (!Arr.contains(arr, item)) {
                    arr.push(item);
                }
            });

            return this;
        },

        removeAll: function(array) {
            var arr = this;

            forEach(array, function(item) {
                var index;

                while ((index = Arr.indexOf(arr, item)) != -1) {
                    arr.splice(index, 1);
                }
            });

            return this;
        }
    });

    return Obj.extract(Arr, ['merge', 'mergeUnique', 'removeAll']);
});