JAR.module('jar.async.Value.M$Forwardable').$import([
    {
        'jar.lang': [
            'Function::bind',
            'MixIn'
        ]
    },
    '.Value::events'
]).$export(function(bind, MixIn, events) {
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
                    update: attemptCustomForward(customSubscription[events.UPDATE], forwardedValue) || bind(forwardedValue.assign, forwardedValue),

                    error: attemptCustomForward(customSubscription[events.ERROR], forwardedValue) || bind(forwardedValue.error, forwardedValue),

                    freeze: attemptCustomForward(customSubscription[events.FREEZE], forwardedValue)
                });

            subscriptions.push(subscriptionID);

            return forwardedValue;
        },

        forwardValueTo: function(forwardedValue, value) {
            return this.forwardTo(forwardedValue, {
                update: bind(forwardedValue.assign, forwardedValue, value)
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