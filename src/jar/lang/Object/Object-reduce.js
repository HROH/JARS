JAR.module('jar.lang.Object.Object-reduce').$export(function() {
    'use strict';

    var Obj = this;

    Obj.enhance({
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
                if (Obj.hasOwn(object, prop)) {
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
        reduce: Obj.reduce
    };
});