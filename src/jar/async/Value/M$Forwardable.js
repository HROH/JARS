JAR.module('jar.async.Value.M$Forwardable').$import([
    {
        'jar.lang': [
            {
                Function: [
                    '::attempt',
                    '::bind',
                    '!modargs'
                ]
            },
            'Mixin',
            'Object!derive,iterate'
        ]
    },
    '.::events'
]).$export(function(attempt, bind, Fn, Mixin, Obj, events) {
    'use strict';

    // TODO better separation of forwardingSubscriptions
    var forwardingSubscriptions = {},
        M$Forwardable;

    M$Forwardable = new Mixin('Forwardable', {
        forward: function(customSubscription) {
            return this.forwardTo(new this.Class(), customSubscription);
        },

        forwardValue: function(value) {
            return this.forwardValueTo(new this.Class(), value);
        },

        forwardTo: function(forwardedValue, customSubscription) {
            var value = this,
                forwardedValueHash = forwardedValue.getHash(),
                subscriptions = forwardingSubscriptions[forwardedValueHash] = forwardingSubscriptions[forwardedValueHash] || [],
                subscriptionID = value.subscribe(Obj.map(events.values(), Fn.partial(createForwardHandle, customSubscription, forwardedValue)));

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
        classes: [this],
        
        destructor: function() {
            Obj.each(forwardingSubscriptions, function(subscriptions, forwardedValueHash) {
			    while(subscriptions.length) {
                    this.unsubscribe(subscriptions.pop());
                }
                
                delete forwardingSubscriptions[forwardedValueHash];
            }, this);
        }
    });

    function createForwardHandle(customSubscription, forwardedValue, event) {
        var customForwardMethod = customSubscription[event] || customSubscription[event.toLowerCase()];
        
        return customForwardMethod ? function(newValue) {
            var result = attempt(customForwardMethod, forwardedValue, newValue);
            
            result.error && forwardedValue.error(result.error);
        } : event !== events.FREEZE && bind(forwardedValue[event === events.UPDATE ? 'assign' : 'error'], forwardedValue);
    }

    return M$Forwardable;
});