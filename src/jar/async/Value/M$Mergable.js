JAR.register({
    MID: 'jar.async.Value.M$Mergable',
    deps: ['.M$Forwardable', {
        'jar.lang': ['Array!iterate', 'MixIn']
    }]
}, function(M$Forwardable, Arr, MixIn) {
    'use strict';

    var M$Mergable = new MixIn('Mergable', {
        merge: function() {
            var values = Arr.from(arguments),
                mergedValue = this.forward();

            values.each(function subscribeToValue(value) {
                value.forwardTo(mergedValue);
            });

            return mergedValue;
        }
    }, {
        classes: [this],

        depends: [M$Forwardable]
    });

    return M$Mergable;
});