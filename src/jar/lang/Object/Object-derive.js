JAR.module('jar.lang.Object.Object-derive').$import([
    'System::isNil',
    '..Array!reduce',
    '.!reduce',
    '..Function::identity'
]).$export(function(isNil, Arr, Obj, identity) {
    'use strict';

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
        filter: transduceWith({
            init: createObject,

            step: filterProperty,

            result: identity
        }, true),
        /**
         * @param {Function} callback
         * @param {*} context
         *
         * @return {Object}
         */
        map: transduceWith({
            init: createObject,

            step: mapProperty,

            result: identity
        }, true),
        /**
         * @return {Object}
         */
        invert: transduceWith({
            init: createObject,

            step: invertProperty,

            result: identity
        })
    });

    function createObject() {
        return new Obj();
    }

    function filterProperty(filteredObject, value, prop, result) {
        if(result) {
            filteredObject[prop] = value;
        }
    }

    function mapProperty(mappedObject, value, prop, result) {
        mappedObject[prop] = result;
    }

    function invertProperty(invertedObject, value, prop) {
        invertedObject[value] = prop;
    }

    function transduceWith(transducer, applyCallback) {
        return function transduce(callback, context) {
	        var object = this,
	            hasContext = applyCallback && !isNil(context);

	        return transducer.result(Obj.reduce(object, function reducer(newObject, value, prop) {
	            transducer.step(newObject, value, prop, hasContext ? callback.call(context, value, prop, object) : applyCallback && callback(value, prop, object));

	            return newObject;
	        }, transducer.init()));
        };
    }

    return Obj.extract(Obj, ['extract', 'filter', 'map', 'invert']);
});
