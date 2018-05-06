JARS.internal('Helpers/Array', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    var Array = {
        /**
         * @param {Array<*>} array
         * @param {JARS~internals.Helpers.Array~Callback} callback
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

    /**
     * @callback JARS~internals.Helpers.Array~Callback
     *
     * @param {*} value
     * @param {number} [index]
     *
     * @return {boolean}
     */

    return Array;
});
