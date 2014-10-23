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
                mergedValue = new this.Class(),
                toFreeze;

            values.unshift(this);
            toFreeze = values.length;

            function onFreeze() {
                --toFreeze || mergedValue.freeze();
            }

            values.each(function subscribeToValue(value) {
                value.forwardTo(mergedValue, {
                    onFreeze: onFreeze
                });
            });

            return mergedValue;
        }
    }, {
        classes: [this],

        depends: [M$Forwardable]
    });

    return M$Mergable;
});