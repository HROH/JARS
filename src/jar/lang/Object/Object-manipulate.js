JAR.register({
    MID: 'jar.lang.Object.Object-manipulate',
    deps: ['..', '.!derive,iterate', '..Array!reduce']
}, function(lang, Obj, Arr) {
    'use strict';

    lang.extendNativeType('Object', {
        update: function(callback, context) {
            Obj.each(this, function updateProperty(value, property, object) {
                object[property] = callback.call(context, value, property, object);
            });
        },

        remove: function(keys) {
            return Arr.reduce(keys, removeProperty, this);
        }
    });

    function removeProperty(object, key) {
        delete object[key];

        return object;
    }

    return Obj.extract(Obj, ['update', 'remove']);
});