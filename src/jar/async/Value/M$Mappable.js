JAR.module('jar.async.Value.M$Mappable').$import([
    '.M$Forwardable',
    'jar.lang.MixIn'
]).$export(function(M$Forwardable, MixIn) {
    'use strict';

    var M$Mappable = new MixIn('Mappable', {
        map: function(mapFn) {
            return this.forward({
                onUpdate: function(forwardedValue, newValue) {
                    forwardedValue.assign(mapFn(newValue));
                }
            });
        }
    }, {
        classes: [this],

        depends: [M$Forwardable]
    });

    return M$Mappable;
});