JAR.register({
    MID: 'jar.lang.Object.Object-iterate',
    deps: ['..', '.!derive']
}, function(lang, Obj) {
    'use strict';

    lang.extendNativeType('Object', {
        each: forIn,

        forEach: forIn
    });

    /**
     * @param {Function} callback
     * @param {*} context
     */
    function forIn(callback, context) {
        var object = this,
            prop;

        for (prop in object) {
            if (Obj.hasOwn(object, prop)) {
                callback.call(context, object[prop], prop, object);
            }
        }
    }

    return Obj.extract(Obj, ['each', 'forEach']);
});