JAR.register({
    MID: 'jar.lang.Object.Object-derive',
    deps: ['..', '..Array!reduce', '.!reduce']
}, function(lang, Arr) {
    'use strict';

    var ObjectCopy = this,
        reduce = ObjectCopy.reduce;

    lang.extendNativeType('Object', {
        /**
         * @param {Array} keys
         * 
         * @return {Object}
         */
        extract: function(keys) {
            var object = this;

            return Arr.reduce(keys, function(extractedObject, key) {
                extractedObject[key] = ObjectCopy.hasOwn(object, key) ? object[key] : undefined;

                return extractedObject;
            }, new ObjectCopy());
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
            }, new ObjectCopy());
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
            }, new ObjectCopy());
        },
        /**
         * @return {Object}
         */
        invert: function() {
            return reduce(this, invert, new ObjectCopy());
        }
    });

    function invert(invertedObject, value, prop) {
        invertedObject[value] = prop;

        return invertedObject;
    }

    return ObjectCopy.extract(ObjectCopy, ['extract', 'filter', 'map', 'invert']);
});