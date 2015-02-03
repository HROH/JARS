JAR.module('jar.async.Value.M$Acceptable').$import([
    '.M$Forwardable',
    'jar.lang.MixIn'
]).$export(function(M$Forwardable, MixIn) {
    'use strict';

    var M$Acceptable = new MixIn('Acceptable', {
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