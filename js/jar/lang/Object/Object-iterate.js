JAR.register({
    MID: 'jar.lang.Object.Object-iterate',
    deps: '..'
}, function(lang) {
    'use strict';

    var ObjectCopy = this;

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
            if (ObjectCopy.hasOwnProperty(object, prop)) {
                callback.call(context, object[prop], prop, object);
            }
        }
    }

    return {
        each: ObjectCopy.each,

        forEach: ObjectCopy.forEach
    };
});