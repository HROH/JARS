JAR.module('jar.async.Value.M$Mergable').$import([
    '.M$Forwardable',
    {
        'jar.lang': [
            'Array!iterate',
            'MixIn'
        ]
    }
]).$export(function(M$Forwardable, Arr, MixIn) {
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