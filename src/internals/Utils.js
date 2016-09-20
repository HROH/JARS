JARS.internal('Utils', function utilsSetup() {
    'use strict';

    var hasOwn = ({}).hasOwnProperty,
        Utils;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    Utils = {
        /**
         * @param {Function} Constructor
         * @param {Object} [newProto]
         *
         * @return {Object}
         */
        create: function(Constructor, newProto) {
            var oldProto = Constructor.prototype, object;

            newProto && (Constructor.prototype = newProto);

            object = new Constructor();

            newProto && (Constructor.prototype = oldProto);

            return object;
        },
        /**
         * @param {Object} object
         * @param {string} prop
         *
         * @return {boolean}
         */
        hasOwnProp: function(object, prop) {
            return hasOwn.call(object, prop);
        },
        /**
         * @param {Object} object
         * @param {function(*, string): boolean} callback
         */
        objectEach: function(object, callback) {
            var property;

            for (property in object) {
                if (Utils.hasOwnProp(object, property)) {
                    if (callback(object[property], property)) {
                        break;
                    }
                }
            }
        },
        /**
         * @param {Object} dest
         * @param {Object} source
         *
         * @return {Object}
         */
        objectMerge: function(dest, source) {
            Utils.objectEach(source, function mergeValue(value, key) {
                dest[key] = value;
            });

            return dest;
        },
        /**
         * @param {(Array|NodeList)} array
         * @param {function(*, number): boolean} callback
         */
        arrayEach: function(array, callback) {
            var index = 0,
                length = array.length;

            for (; index < length; index++) {
                if (callback(array[index], index)) {
                    break;
                }
            }
        }
    };

    return Utils;
});
