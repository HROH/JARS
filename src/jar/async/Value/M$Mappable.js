JAR.register({
    MID: 'jar.async.Value.M$Mappable',
    deps: ['.M$Forwardable', 'jar.lang.MixIn']
}, function(M$Forwardable, MixIn) {
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