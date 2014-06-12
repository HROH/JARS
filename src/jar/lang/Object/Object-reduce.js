JAR.register({
    MID: 'jar.lang.Object.Object-reduce',
    deps: '..'
}, function(lang) {
    'use strict';

    var ObjectCopy = this;

    lang.extendNativeType('Object', {
        reduce: function(callback, initialValue) {
            var object = this,
                isValueSet = false,
                prop,
                ret;

            if (arguments.length > 1) {
                ret = initialValue;
                isValueSet = true;
            }

            for (prop in object) {
                if (ObjectCopy.hasOwn(object, prop)) {
                    if (isValueSet) {
                        ret = callback(ret, object[prop], prop, object);
                    }
                    else {
                        ret = object[prop];
                        isValueSet = true;
                    }
                }
            }

            return ret;
        }
    });

    return {
        reduce: ObjectCopy.reduce
    };
});