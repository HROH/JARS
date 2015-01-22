JAR.module('jar.lang.Object.Object-derive').$import([
    '..Array!reduce',
    '.!reduce'
]).$export(function(Arr, Obj) {
    'use strict';

    var reduce = Obj.reduce;

    Obj.enhance({
        /**
         * @param {Array} keys
         * 
         * @return {Object}
         */
        extract: function(keys) {
            var object = this;

            return Arr.reduce(keys, function(extractedObject, key) {
                extractedObject[key] = Obj.hasOwn(object, key) ? object[key] : undefined;

                return extractedObject;
            }, new Obj());
        },
        /**
         * @param {Function} callback
         * @param {*} context
         * 
         * @return {Object}
         */
        filter: function(callback, context) {
            var object = this;

            return reduce(object, function(filteredObject, value, prop) {
                if (callback.call(context, value, prop, object)) {
                    filteredObject[prop] = value;
                }

                return filteredObject;
            }, new Obj());
        },
        /**
         * @param {Function} callback
         * @param {*} context
         * 
         * @return {Object}
         */
        map: function(callback, context) {
            var object = this;

            return reduce(object, function(mappedObject, value, prop) {
                mappedObject[prop] = callback.call(context, value, prop, object);

                return mappedObject;
            }, new Obj());
        },
        /**
         * @return {Object}
         */
        invert: function() {
            return reduce(this, invert, new Obj());
        }
    });

    function invert(invertedObject, value, prop) {
        invertedObject[value] = prop;

        return invertedObject;
    }

    return Obj.extract(Obj, ['extract', 'filter', 'map', 'invert']);
});