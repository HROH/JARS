JAR.register({
    MID: 'jar.lang.Object.Object-derive',
    deps: ['..', '..Array!reduce', '.!info|reduce']
}, function(lang, Arr) {
    'use strict';

    var ObjectCopy = this;

    lang.extendNativeType('Object', {
        /**
         * @param {Array} keys
         * 
         * @return {Object}
         */
        extract: function(keys) {
            var object = this;

            return Arr.reduce(keys, function(extractedObject, key) {
                extractedObject[key] = ObjectCopy.prop(object, key);

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

            return ObjectCopy.reduce(object, function(filteredObject, value, prop) {
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

            return ObjectCopy.reduce(object, function(mappedObject, value, prop) {
                mappedObject[prop] = callback.call(context, value, prop, object);

                return mappedObject;
            }, new ObjectCopy());
        },
        /**
         * @return {Object}
         */
        transpose: function() {
            return ObjectCopy.reduce(this, transpose, new ObjectCopy());
        }
    });

    function transpose(transposedObject, value, prop) {
        transposedObject[value] = prop;

        return transposedObject;
    }

    return {
        extract: ObjectCopy.extract,

        filter: ObjectCopy.filter,

        map: ObjectCopy.map,

        transpose: ObjectCopy.transpose
    };
});