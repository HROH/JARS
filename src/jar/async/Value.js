JAR.register({
    MID: 'jar.async.Value',
    deps: ['.Scheduler', {
        System: ['::isSet', '::isA', '::isFunction'],
        'jar.lang': ['Class', {
            Object: ['!derive,iterate', '::hasOwn']
        }, 'Function::noop', 'Constant', 'Enum']
    }],
    bundle: ['M$Acceptable', 'M$Accumulator', 'M$Debuggable', 'M$Decidable', 'M$FlowRegulator', 'M$Forwardable', 'M$Mappable', 'M$Memorizable', 'M$Mergable', 'M$Skippable', 'M$Takeable']
}, function(Scheduler, isSet, isA, isFunction, Class, Obj, hasOwn, noop, Constant, Enum) {
    'use strict';

    var setZero = Constant(0),
        events = new Enum(['UPDATE', 'ERROR', 'FREEZE'], {
            mirror: true
        }),
        handleNames = Obj.map(events.values(), function(event) {
            return 'on' + event.charAt(0) + event.substr(1).toLowerCase();
        }),
        Value;

    Value = Class('Value', Obj.extend({
        $: {
            construct: function(value, changeScheduler) {
                this._$counters = Obj.map(events.values(), setZero);
                this._$valueRefs = {};
                this._$subscribers = Obj();
                this._$changeScheduler = isA(changeScheduler, Scheduler) ? changeScheduler : new Scheduler();

                isSet(value) && this.assign(value);
            },

            assign: assignValue,

            '=': assignValue,

            update: function(updater) {
                return this._$scheduleChange(events.UPDATE, updater);
            },

            error: function(newError) {
                isA(newError, Error) || (newError = new TypeError('Expected value.error() to be called with Error object'));

                return this._$scheduleChange(events.ERROR, Constant(newError));
            },

            freeze: function() {
                return this._$scheduleChange(events.FREEZE, noop);
            },

            subscribe: function(subscription) {
                var value = this,
                    $proxy = value.$proxy,
                    subscriptionID = false,
                    onFreeze = subscription.onFreeze,
                    changeScheduler = value._$changeScheduler;

                changeScheduler.isScheduled() || changeScheduler.schedule(function scheduleInit() {
                    $proxy(value, function proxiedInit() {
                        Obj.each(events.values(), function invokeSubscriberInitial(event) {
                            if (value._$counters[event]) {
                                value._$invokeSubscriber(subscription, handleNames[event], value._$valueRefs[event]);
                            }
                        });
                    });
                });

                if (!value._$counters[events.FREEZE]) {
                    subscriptionID = value.getHash() + ' subscriber_id:' + value._$nextSubscriberID;

                    value._$nextSubscriberID++;

                    subscription.onFreeze = function() {
                        onFreeze && onFreeze.call(subscription);
                        value.unsubscribe(subscriptionID);
                    };

                    value._$subscribers[subscriptionID] = subscription;
                }

                return subscriptionID;
            },

            unsubscribe: function(subscriptionID) {
                var subscribers = this._$subscribers,
                    unsubscribed = false;

                if (hasOwn(subscribers, subscriptionID)) {
                    delete subscribers[subscriptionID];

                    unsubscribed = true;
                }

                return unsubscribed;
            },

            countSubscribers: function() {
                return this._$subscribers.size();
            }
        },

        _$: {
            valueRefs: null,

            counters: null,

            subscribers: null,

            nextSubscriberID: 0,

            changeScheduler: null,

            scheduleChange: function(event, changer) {
                var value = this,
                    $proxy = value.$proxy;

                value._$changeScheduler.schedule(function changeTask() {
                    $proxy(value, function proxiedChange() {
                        var value = this,
                            currentValue = value._$valueRefs[event],
                            newValue;

                        if (!this._$counters[events.FREEZE]) {
                            newValue = changer(currentValue);

                            value._$counters[event]++;
                            value._$valueRefs[event] = newValue;

                            value._$subscribers.each(function forwardValueToSubscriber(subscriber) {
                                value._$invokeSubscriber(subscriber, handleNames[event], newValue);
                            });

                            if (event === events.ERROR && !value.countSubscribers()) {
                                throw new Error(newValue.message);
                            }
                        }
                    });
                });

                return this;
            },

            invokeSubscriber: function(subscriber, handleName, value) {
                if (isFunction(subscriber[handleName])) {
                    subscriber[handleName](value);
                }
                else if (handleName === handleNames[events.ERROR]) {
                    throw new Error(value.message);
                }
            }
        }
    }, Obj.invert(handleNames).map(addSubscriberHandle)), {
        events: events
    });

    function addSubscriberHandle(event, handleName) {
        return function(handle) {
            var subscription = {};

            subscription[handleName] = handle;

            return this.subscribe(subscription);
        };
    }

    function assignValue(newValue) {
        /*jslint validthis: true */
        return this.update(Constant(newValue));
    }

    return Value;
});