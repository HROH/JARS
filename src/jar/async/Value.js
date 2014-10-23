JAR.register({
    MID: 'jar.async.Value',
    deps: ['.TaskRunner', {
        System: ['::isSet', '::isA', '::isFunction']
    }, {
        'jar.lang': ['Array!iterate,reduce', 'Class', {
            Object: ['!derive,iterate', '::hasOwn']
        }, 'Function::noop', 'Constant']
    }],
    bundle: ['M$Acceptable', 'M$Accumulator', 'M$Debuggable', 'M$Decidable', 'M$FlowRegulator', 'M$Forwardable', 'M$Mappable', 'M$Memorizable', 'M$Mergable', 'M$Skipable', 'M$Takeable']
}, function(TaskRunner, isSet, isA, isFunction, Arr, Class, Obj, hasOwn, noop, Constant) {
    'use strict';

    var async = this,
        VALUE_UPDATE = 0,
        VALUE_ERROR = 1,
        VALUE_FREEZE = 2,
        changes = [],
        Value;

    changes[VALUE_UPDATE] = {
        handle: 'onUpdate',

        counter: 'updated',

        key: 'value'
    };

    changes[VALUE_ERROR] = {
        handle: 'onError',

        counter: 'errored',

        key: 'error'
    };

    changes[VALUE_FREEZE] = {
        handle: 'onFreeze',

        counter: 'frozen'
    };

    Value = Class('Value', Obj.extend({
        $: {
            construct: function(value, changeRunner) {
                this._$handles = Obj();
                this._$changeRunner = isA(changeRunner, TaskRunner) ? changeRunner : new TaskRunner();

                arguments.length && this.assign(value);
            },

            assign: assignValue,

            '=': assignValue,

            update: function(updater) {
                return this._$scheduleChange(VALUE_UPDATE, updater);
            },

            error: function(newError) {
                isA(newError, Error) || (newError = new TypeError('Expected value.error() to be called with Error object'));

                return this._$scheduleChange(VALUE_ERROR, Constant(newError));
            },

            freeze: function() {
                return this._$scheduleChange(VALUE_FREEZE, noop);
            },

            subscribe: function(subscription) {
                var value = this,
                    subscriptionID = false,
                    onFreeze = subscription.onFreeze;

                value._$changeRunner.isRunning() || async.wait(value.$proxy, 0, value, function delayInitialCall() {
                    Arr.each(changes, function invokeHandleInitial(change) {
                        if (value['_$' + change.counter]) {
                            value._$attemptInvokeHandle(subscription, change.handle, value['_$' + change.key]);
                        }
                    });
                });

                if (!value._$frozen) {
                    subscriptionID = value.getHash() + ' handle_id:' + value._$nextHandleID;

                    value._$nextHandleID++;
                    value._$handlesCount++;

                    subscription.onFreeze = function() {
                        onFreeze && onFreeze.call(subscription);
                        value.unsubscribe(subscriptionID);
                    };

                    value._$handles[subscriptionID] = subscription;
                }

                return subscriptionID;
            },

            unsubscribe: function(subscriptionID) {
                var handles = this._$handles,
                    unsubscribed = false;

                if (hasOwn(handles, subscriptionID)) {
                    this._$handlesCount--;

                    delete handles[subscriptionID];

                    unsubscribed = true;
                }

                return unsubscribed;
            }
        },

        _$: {
            value: null,

            updated: 0,

            error: null,

            errored: 0,

            frozen: 0,

            handles: null,

            handlesCount: 0,

            nextHandleID: 0,

            changeRunner: null,

            scheduleChange: function(changeType, changer) {
                var value = this,
                    $proxy = value.$proxy;

                value._$changeRunner.schedule(function changeTask() {
                    $proxy(value, function proxiedChange() {
                        var value = this,
                            change = changes[changeType],
                            handleMethod = change.handle,
                            key = change.key,
                            currentValue = value['_$' + key],
                            newValue;

                        if (!this._$frozen) {
                            newValue = changer(currentValue);

                            value._$handles.each(function forwardValueToHandle(handle) {
                                value._$attemptInvokeHandle(handle, handleMethod, newValue);
                            });

                            if (changeType === VALUE_ERROR && !value._$handlesCount) {
                                value._$onUnhandledError(newValue);
                            }

                            key && (value['_$' + key] = newValue);

                            value['_$' + change.counter]++;
                        }
                    });
                });

                return this;
            },

            attemptInvokeHandle: function(handle, handleType, value) {
                var isUnHandledError = false;

                try {
                    if (handle[handleType]) {
                        handle[handleType](value);
                    }
                    else {
                        isUnHandledError = handleType === changes[VALUE_ERROR].handle;
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
    }, Arr.reduce(changes, addHandleSubscriber, {})));

    function addHandleSubscriber(handleSubscribers, change) {
        var handleName = change.handle;

        handleSubscribers[handleName] = function(handle) {
            var subscription = {};

            subscription[handleName] = handle;

            return this.subscribe(subscription);
        };

        return handleSubscribers;
    }

    function assignValue(newValue) {
        /*jslint validthis: true */
        return this.update(Constant(newValue));
    }

    return Value;
});