JAR.register({
    MID: 'jar.async.Value.M$Forwardable',
    deps: {
        'jar.lang': ['Function::bind', 'MixIn']
    }
}, function(bind, MixIn) {
    'use strict';

    var forwardingSubscriptions = {},
        M$Forwardable;

    M$Forwardable = new MixIn('Forwardable', {
        forward: function(customSubscription) {
            return this.forwardTo(new this.Class(), customSubscription);
        },

        forwardValue: function(value) {
            return this.forwardValueTo(new this.Class(), value);
        },

        forwardTo: function(forwardedValue, customSubscription) {
            var value = this,
                subscriptions = forwardingSubscriptions[forwardedValue.getHash()] = forwardingSubscriptions[forwardedValue.getHash()] || [],
                subscriptionID = value.subscribe({
                    onUpdate: attemptCustomForward(customSubscription.onUpdate, forwardedValue) || bind(forwardedValue.assign, forwardedValue),

                    onError: attemptCustomForward(customSubscription.onError, forwardedValue) || bind(forwardedValue.error, forwardedValue),

                    onFreeze: attemptCustomForward(customSubscription.onFreeze, forwardedValue)
                });

            subscriptions.push(subscriptionID);

            return forwardedValue;
        },

        forwardValueTo: function(forwardedValue, value) {
            return this.forwardTo(forwardedValue, {
                onUpdate: bind(forwardedValue.assign, forwardedValue, value)
            });
        },

        stopForwardingTo: function(forwardedValue) {
            var subscriptions = forwardingSubscriptions[forwardedValue.getHash()] || [];
			
			while(subscriptions.length) {
                this.unsubscribe(subscriptions.pop());
            }
        }
    }, {
        classes: [this]
    });

    function attemptCustomForward(customForwardMethod, forwardedValue) {
        return customForwardMethod && function(newValue) {
            try {
                customForwardMethod(forwardedValue, newValue);
            }
            catch (e) {
                forwardedValue.error(e);
            }
        };
    }

    return M$Forwardable;
});