JAR.register({
    MID: 'jar.async.Value.M$Mergable',
    deps: {
        'jar.lang': ['Array!iterate', 'MixIn']
    }
}, function(Arr, MixIn) {
    'use strict';

    var M$Mergable = new MixIn('Mergable', {
        merge: function() {
            var values = Arr.from(arguments),
                toFreeze = values.length,
                mergedValue = new this.Class();

            values.unshift(this);

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
        classes: [this]
    });

    return M$Mergable;
});