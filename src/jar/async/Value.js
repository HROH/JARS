JAR.register({
    MID: 'jar.async.Value',
    deps: [{
        System: ['::isA', '::isFunction']
    }, {
        'jar.lang': ['Array!iterate', 'Object!derive,iterate', 'Class', {
            Function: ['::identity', '::negate']
        }]
    }]
}, function(isA, isFunction, Arr, Obj, Class, identity, negate) {
    'use strict';

    var async = this,
        returnTrue = Boolean,
        returnFalse = negate(returnTrue),
        VALUE_UPDATE = 0,
        VALUE_ERROR = 1,
        VALUE_FREEZE = 2,
        eventHandles = [],
        eventKeys = [],
        eventChecks = [],
        Value;

    eventHandles[VALUE_UPDATE] = 'onUpdate';
    eventHandles[VALUE_ERROR] = 'onError';
    eventHandles[VALUE_FREEZE] = 'onFreeze';

    eventKeys[VALUE_UPDATE] = 'value';
    eventKeys[VALUE_ERROR] = 'error';

    eventChecks[VALUE_UPDATE] = 'isValueAssigned';
    eventChecks[VALUE_ERROR] = 'isError';
    eventChecks[VALUE_FREEZE] = 'isFrozen';


    Value = Class('Value', {
        construct: function(value) {
            this._$handles = Obj();

            value && this.assign(value);
        },

        onUpdate: function(updateFn) {
            return this.subscribe({
                onUpdate: updateFn
            });
        },

        onError: function(errorFn) {
            return this.subscribe({
                onError: errorFn
            });
        },

        onFreeze: function(freezeFn) {
            return this.subscribe({
                onFreeze: freezeFn
            });
        },

        take: function(n) {
            var takenValue;

            if (n > 0) {
                takenValue = this.doWhile(function takeWhile() {
                    return --n > 0;
                });
            }
            else {
                takenValue = new Value();

                takenValue.error(new Error('Can\'t take 0 values'));
                takenValue.freeze();
            }

            return takenValue;
        },

        merge: function() {
            var values = Arr.from([this]).merge(Arr.from(arguments)),
                toFreeze = values.length,
                mergedValue = new Value();

            values.each(function subscribeToValue(value) {
                value.subscribe({
                    onUpdate: function(newValue) {
                        mergedValue.assign(newValue);
                    },

                    onError: function(error) {
                        mergedValue.error(error);
                    },

                    onFreeze: function() {
                        --toFreeze && mergedValue.freeze();
                    }
                });
            });

            return mergedValue;
        },

        $: {
            assign: assignValue,

            '=': assignValue,

            error: function(newError) {
                isA(newError, Error) || (newError = new TypeError('Expected error to be called with Error object'));

                return this._$onChange(VALUE_ERROR, newError);
            },

            freeze: function() {
                return this._$onChange(VALUE_FREEZE);
            },

            map: function(mapFn) {
                return this._$chainValue({
                    transform: mapFn
                });
            },

            filter: function(filterFn) {
                return this._$chainValue({
                    guardNext: filterFn
                });
            },

            scan: function(scanFn, startValue) {
                var value = this,
                    $proxy = value.$proxy;

                return this._$chainValue({
                    start: startValue,

                    transform: function(newValue) {
                        return scanFn($proxy(value, proxiedGetValue), newValue);
                    }
                });
            },

            doUntil: function(untilFn) {
                return this._$chainValue({
                    guardComplete: untilFn
                });
            },

            until: function(untilFn) {
                return this._$chainValue({
                    guardFilter: negate(untilFn),

                    guardComplete: untilFn
                });
            },

            doWhile: function(whileFn) {
                return this._$chainValue({
                    guardComplete: negate(whileFn)
                });
            },

            'while': function(whileFn) {
                return this._$chainValue({
                    guardFilter: whileFn,

                    guardComplete: negate(whileFn)
                });
            },

            subscribe: function(subscription) {
                var value = this,
                    subscriptionID = false,
                    onFreeze = subscription.onFreeze;

                async.wait(value.$proxy, 0, value, function delayInitialCall() {
                    if (value._$isValueAssigned) {
                        value._$attemptInvokeHandle(subscription, VALUE_UPDATE, value._$value);
                    }

                    if (value._$isError) {
                        value._$attemptInvokeHandle(subscription, VALUE_ERROR, value._$error);
                    }

                    if (value._$isFrozen) {
                        value._$attemptInvokeHandle(subscription, VALUE_FREEZE);
                    }
                });

                if (!value._$isFrozen) {
                    subscriptionID = value.getHash() + ' handle_id:' + value._$nextHandleID;

                    value._$nextHandleID++;
                    value._$handlesCount++;

                    subscription.onFreeze = function() {
                        onFreeze && onFreeze();
                        value.unsubscribe(subscriptionID);
                    };

                    value._$handles[subscriptionID] = subscription;
                }

                return subscriptionID;
            },

            unsubscribe: function(subscriptionID) {
                var handles = this._$handles,
                    unsubscribed = false;

                if (Obj.hasOwn(handles, subscriptionID)) {
                    this._$handlesCount--;

                    delete handles[subscriptionID];

                    unsubscribed = true;
                }

                return unsubscribed;
            }
        },

        _$: {
            value: null,

            isValueAssigned: false,

            error: null,

            isError: false,

            isFrozen: false,

            handles: null,

            handlesCount: 0,

            nextHandleID: 0,

            onChange: function(eventType, newValue) {
                var value = this;

                //TODO improve asynchronous handling
                async.wait(value.$proxy, 0, value, changeValue, [eventType, newValue]);

                return value;
            },

            chainValue: function(options) {
                var startValue = options.start,
                    transform = options.transform || identity,
                    shouldUpdate = options.guardNext || returnTrue,
                    shouldComplete = options.guardComplete || returnFalse,
                    chainedValue = new Value(startValue);

                this.subscribe({
                    onUpdate: function(newValue) {
                        if (shouldUpdate(newValue)) {
                            newValue = transform(newValue);
                            chainedValue.assign(newValue);
                        }

                        shouldComplete(newValue) && chainedValue.freeze();
                    },

                    onError: function(error) {
                        chainedValue.error(error);
                    },

                    onFreeze: function() {
                        chainedValue.freeze();
                    }
                });

                return chainedValue;
            },

            attemptInvokeHandle: function(handle, handleType, value) {
                var isUnHandledError = false;

                try {
                    if (handle[handleType]) {
                        handle[handleType](value);
                    }
                    else {
                        isUnHandledError = handleType === eventHandles[VALUE_ERROR];
                    }
                }
                catch (e) {
                    if (handle.error) {
                        handle.error(e);
                    }
                    else {
                        value = e;
                        isUnHandledError = true;
                    }
                }

                isUnHandledError && this._$onUnhandledError(value);
            },

            onUnhandledError: function(error) {
                this.Class.logger.error('Unhandled ${name}: ${message} for ${hash}', {
                    name: error.name,

                    message: error.message,

                    hash: this.getHash()
                });
            }
        }
    });

    function assignValue(newValue) {
        /*jslint validthis: true */
        if (isFunction(newValue)) {
            newValue = newValue(this._$value);
        }

        return this._$onChange(VALUE_UPDATE, newValue);
    }

    function changeValue(eventType, newValue) {
        /*jslint validthis: true */
        var value = this,
            handleType = eventHandles[eventType],
            key = eventKeys[eventType];

        if (!value._$isFrozen) {
            value._$handles.each(function forwardValueToHandLe(handle) {
                value._$attemptInvokeHandle(handle, handleType, newValue);
            });

            if (eventType === VALUE_ERROR && !value._$handlesCount) {
                value._$onUnhandledError(newValue);
            }

            key && (value['_$' + key] = newValue);

            value['_$' + eventChecks[eventType]] = true;
        }
    }

    function proxiedGetValue() {
        /*jslint validthis: true */
        return this._$value;
    }

    return Value;
});