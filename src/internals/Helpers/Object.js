JARS.internal('Helpers/Object', function() {
    'use strict';

    var hasOwn = ({}).hasOwnProperty,
        Object;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    Object = {
        /**
         * @param {function()} Constructor
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
        each: function(object, callback) {
            var property;

            for (property in object) {
                if (Object.hasOwnProp(object, property)) {
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
        merge: function(dest, source) {
            Object.each(source, function mergeValue(value, key) {
                dest[key] = value;
            });

            return dest;
        }
    };

    return Object;
});
