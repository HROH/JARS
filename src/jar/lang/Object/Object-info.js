JAR.register({
    MID: 'jar.lang.Object.Object-info',
    deps: ['..', '.!reduce|derive']
}, function(lang, Obj) {
    'use strict';

    var reduce = Obj.reduce;

    lang.extendNativeType('Object', {
        keys: function() {
            return reduce(this, pushKey, []);
        },

        pairs: function() {
            return reduce(this, pushKeyValue, []);
        },

        prop: function(key) {
            return Obj.hasOwn(this, key) ? this[key] : undefined;
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

    function pushKey(array, value, key) {
        array[array.length] = key;

        return array;
    }

    function pushValue(array, value) {
        array[array.length] = value;

        return array;
    }

    function pushKeyValue(array, value, key) {
        array[array.length] = [key, value];

        return array;
    }

    return Obj.extract(Obj, ['keys', 'pairs', 'prop', 'size', 'values']);
});