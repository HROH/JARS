JAR.register({
    MID: 'jar.async.Value.M$Forwardable',
    deps: {
        'jar.lang': [{
            Constant: ['.', '::TRUE', '::FALSE'],
            Function: ['::bind', '::identity']
        }, 'MixIn', 'Object']
    }
}, function(Constant, constantTrue, constantFalse, bind, identity, MixIn, Obj) {
    'use strict';

    var M$Forwardable = new MixIn('Forwardable', {
        forward: function() {
            return this.forwardTo(new this.Class());
        },

        forwardValue: function(value) {
            return this.forwardWithOptions({
                transform: Constant(value)
            });
        },

        forwardTo: function(forwardedValue, customSubscription) {
            var value = this,
                subscriptionID = value.subscribe(Obj.merge({
                    onUpdate: bind(forwardedValue.assign, forwardedValue),

                    onError: bind(forwardedValue.error, forwardedValue),

                    onFreeze: bind(forwardedValue.freeze, forwardedValue)
                }, customSubscription));

            forwardedValue.onFreeze(bind(value.unsubscribe, value, subscriptionID));

            return forwardedValue;
        },

        forwardValueTo: function(forwardedValue, value) {
            return this.forwardTo(forwardedValue, {
                onUpdate: Constant(value)
            });
        },

        forwardWithOptions: function(options) {
            var transform = options.transform || identity,
                shouldUpdate = options.guardUpdate || constantTrue,
                shouldFreeze = options.guardFreeze || constantFalse,
                forwardedValue = new this.Class();

            this.forwardTo(forwardedValue, {
                onUpdate: function(newValue) {
                    if (shouldUpdate(newValue)) {
                        forwardedValue.assign(transform(newValue));
                    }

                    shouldFreeze(newValue) && forwardedValue.freeze();
                }
            });

            return forwardedValue;
        }
    }, {
        classes: [this]
    });

    return M$Forwardable;
});