JAR.register({
    MID: 'jar.lang.Object.Object-info',
    deps: ['.!reduce,derive', '..Array!reduce']
}, function(Obj, Arr) {
    'use strict';

    var reduce = Obj.reduce;

    Obj.enhance({
        keys: function() {
            return reduce(this, pushKey, Arr());
        },

        pairs: function() {
            return reduce(this, pushKeyValue, Arr());
        },

        prop: function(key) {
            var propList = key.split('.');

            return Arr.reduce(propList, extractProperty, this);
        },

        size: function() {
            return reduce(this, countProperties, 0);
        },

        values: function() {
            return reduce(this, pushValue, Arr());
        }
    });

    function extractProperty(obj, key) {
        return (obj && Obj.hasOwn(obj, key)) ? obj[key] : undefined;
    }

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
        array[array.length] = Arr(key, value);

        return array;
    }

    return Obj.extract(Obj, ['keys', 'pairs', 'prop', 'size', 'values']);
});