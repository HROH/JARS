JAR.register({
    MID: 'jar.async.Value.M$Acceptable',
    deps: ['.M$Forwardable', 'jar.lang.MixIn']
}, function(M$Forwardable, MixIn) {
    'use strict';

    var M$Acceptable = new MixIn('Acceptable', {
        accept: function(acceptFn) {
            return this.forwardWithOptions({
                guardUpdate: acceptFn
            });
        }
    }, {
        classes: [this],
        
        depends: [M$Forwardable]
    });

    return M$Acceptable;
});