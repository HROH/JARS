JAR.register({
    MID: 'jar.async.Value.M$Acceptable',
    deps: ['.M$Forwardable', 'jar.lang.MixIn']
}, function(M$Forwardable, MixIn) {
    'use strict';

    var M$Acceptable = new MixIn('Acceptable', {
        accept: function(acceptFn) {
            return this.forward({
                onUpdate: function(forwardedValue, newValue) {
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