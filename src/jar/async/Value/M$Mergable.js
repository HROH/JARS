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

            values.each(function subscribeToValue(value) {
                value.subscribe({
                    onUpdate: function(newValue) {
                        mergedValue.assign(newValue);
                    },

                    onError: function(error) {
                        mergedValue.error(error);
                    },

                    onFreeze: function() {
                        --toFreeze || mergedValue.freeze();
                    }
                });
            });

            return mergedValue;
        }
    }, {
        classes: [this]
    });

    return M$Mergable;
});