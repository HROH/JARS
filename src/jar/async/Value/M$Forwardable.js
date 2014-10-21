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
        forward: function(customSubscription) {
            return this.forwardTo(new this.Class(), customSubscription);
        },

        forwardValue: function(value) {
            return this.forwardValueTo(new this.Class(), value);
        },

        forwardWithOptions: function(options) {
            return this.forwardWithOptionsTo(new this.Class(), options);
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
            return this.forwardWithOptionsTo(forwardedValue, {
                transform: Constant(value)
            });
        },

        forwardWithOptionsTo: function(forwardedValue, options) {
            var transform = options.transform || identity,
                shouldUpdate = options.guardUpdate || constantTrue,
                shouldFreeze = options.guardFreeze || constantFalse;

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