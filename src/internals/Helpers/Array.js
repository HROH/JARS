JARS.internal('Helpers/Array', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    var Array = {
        /**
         * @param {(Array|NodeList)} array
         * @param {function(*, number): boolean} callback
         */
        each: function(array, callback) {
            var index = 0,
                length = array.length;

            for (; index < length; index++) {
                if (callback(array[index], index)) {
                    break;
                }
            }
        }
    };

    return Array;
});
