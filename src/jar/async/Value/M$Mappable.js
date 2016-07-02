JAR.module('jar.async.Value.M$Mappable').$import([
    '.M$Forwardable',
    'jar.lang.Mixin'
]).$export(function(M$Forwardable, Mixin) {
    'use strict';

    var M$Mappable = new Mixin('Mappable', {
        map: function(mapFn) {
            return this.forward({
                update: function(forwardedValue, newValue) {
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