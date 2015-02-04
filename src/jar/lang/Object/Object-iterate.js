JAR.module('jar.lang.Object.Object-iterate').$import('.!derive').$export(function(Obj) {
    'use strict';

    var forOwn = createForIn(true),
        forInherited = createForIn();

    function createForIn(skipNotOwn) {
        return function forIn(callback, context) {
            /*jslint validthis: true */
            var object = this,
                prop;

            for (prop in object) {
                if (!skipNotOwn || Obj.hasOwn(object, prop)) {
                    callback.call(context, object[prop], prop, object);
                }
            }
        };
    }

    Obj.enhance({
        each: forOwn,

        forEach: forOwn,

        eachInherited: forInherited,

        forEachInherited: forInherited
    });

    return Obj.extract(Obj, ['each', 'forEach']);
});