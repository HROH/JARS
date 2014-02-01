JAR.register({
    MID: 'jar.lang.Object.Object-info',
    deps: ['..', '.!reduce']
}, function(lang) {
	'use strict';
	
	var ObjectCopy = this,
		reduce = ObjectCopy.reduce;
	
    lang.extendNativeType('Object', {
        keys: function() {
            return reduce(this, pushKey, []);
        },

        prop: function(property) {
            return ObjectCopy.hasOwnProperty(this, property) && this[property];
        },

        size: function() {
            return reduce(this, countProperties, 0);
        },

        values: function() {
            return reduce(this, pushValue, []);
        }
    });

    function countProperties(size) {
        return ++size;
    }

    function pushKey(array, value, prop) {
        array[array.length] = prop;

        return array;
    }

    function pushValue(array, value) {
        array[array.length] = value;

        return array;
    }

    return {
		keys: ObjectCopy.keys,
		
		prop: ObjectCopy.prop,
		
		size: ObjectCopy.size,
		
		values: ObjectCopy.values
    };
});