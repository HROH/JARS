JAR.module('jar.async.Value.M$Mergable').$import([
    '.M$Forwardable',
    {
        'jar.lang': [
            'Array!iterate',
            'Mixin'
        ]
    }
]).$export(function(M$Forwardable, Arr, Mixin) {
    'use strict';

    var M$Mergable = new Mixin('Mergable', {
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