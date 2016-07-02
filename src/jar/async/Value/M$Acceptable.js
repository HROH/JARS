JAR.module('jar.async.Value.M$Acceptable').$import([
    '.M$Forwardable',
    'jar.lang.Mixin'
]).$export(function(M$Forwardable, Mixin) {
    'use strict';

    var M$Acceptable = new Mixin('Acceptable', {
        accept: function(acceptFn) {
            return this.forward({
                update: function(forwardedValue, newValue) {
                    if (acceptFn(newValue)) {
                        forwardedValue.assign(newValue);
                    }
                }
            });
        }
    }, {
        classes: [this],

        depends: [M$Forwardable]
    });

    return M$Acceptable;
});