JAR.module('jar.async.Promise').$import([
    {
        System: [
            '::format',
            '::isA',
            '::isObject',
            '::isArrayLike',
            '::isFunction',
            '!'
        ],
        '..lang': [
            'Class',
            'Object!info,iterate',
            'Array!iterate,reduce',
            'Enum',
            {
                Function: [
                    '::identity',
                    '::bind',
                    '!flow,modargs'
                ]
            }
        ],
        '.Value': [
            '.',
            'M$Forwardable'
        ]
    },
    '.Scheduler'
]).$export(function(format, isA, isObject, isArrayLike, isFunction, config, Class, Obj, Arr, Enum, identity, bind, Fn, Value, M$Forwardable, Scheduler) {
    'use strict';

    // TODO support stacktraces:
    // - formating error messages
    // - combine stacks of previous and current error
    // - filter unwanted information
    // - resources: https://github.com/kriskowal/q/blob/v2/q.js
    // Unhandled rejection:
    // - always throw, consume per promise or consume if configured?

    var ERROR_PROMISE_SELF_RESOLUTION = '${promiseHash} can\'t be resolved with itself!',
        ERROR_PROMISE_DESTRUCTED_REJECTION = 'The connected promise was destructed',
        ERROR_PROMISE_TIMEOUT_REJECTION = 'Timed out after ${ms} ms',
        ERROR_PROMISE_UNHANDLED_REJECTION = 'Possibly unhandled rejection of ${promiseHash} with reason: ${reason}',
        //ERROR_PROMISE_INFINITE_RECURSION = 'Infinite recursion between ${firstPromiseHash} and ${secondPromiseHash}',
        promiseState = new Enum(['INIT', 'PENDING', 'REJECTED', 'RESOLVED']),
        rejectionHandlers = Arr(),
        promiseScheduler = new Scheduler(),
        partial = Fn.partial,
        Promise;

    Value.mixin(M$Forwardable);

    Promise = Class('Promise', {
        $: {
            construct: function(handler) {
                var promise = this,
                    resolveTransition = createStateTransition(promise, promiseState.RESOLVED),
                    rejectTransition = createStateTransition(promise, promiseState.REJECTED),
                    notifyTransition = createStateTransition(promise, promiseState.PENDING);

                promise._$ChainClass = Promise;

                promise._$value = new Value(null, promiseScheduler);

                promise.when(handler);
                promise.done(resolveTransition, rejectTransition, notifyTransition);

                promise.Class.addDestructor(rejectWithPromiseDestructed, promise);
            },

            when: function(handler) {
                var promise = this,
                    value = promise._$value,
                    resolve, reject, notify;

                if (isFunction(handler) && !promise.isInitialized()) {
                    promise._$transitionState(promiseState.PENDING);

                    resolve = function(valueToAssign) {
                        var valueIsPromise = Promise.isInstance(valueToAssign);

                        if (valueToAssign === promise) {
                            value.error(new TypeError(format(ERROR_PROMISE_SELF_RESOLUTION, {
                                promiseHash: promise.getHash()
                            })));
                        }
                        else if (valueIsPromise || isThenable(valueToAssign)) {
                            valueToAssign.then(resolve, reject, notify);
                        }
                        else {
                            assignWithState(value, promiseState.RESOLVED, valueToAssign);
                        }
                    };
                    reject = bind(value.error, value);
                    notify = partial(assignWithState, value, promiseState.PENDING);

                    try {
                        handler(resolve, reject, notify);
                    }
                    catch (e) {
                        reject(e);
                    }
                }

                return this;
            },

            then: function(thenCallback, failCallback, progressCallback) {
                var promise = this,
                    handledValue = new Value(null, promiseScheduler),
                    handleThen = partial(handleUpdate, thenCallback, progressCallback);

                this._$value.forwardTo(handledValue, {
                    update: function(forwardedValue, data) {
                        assignWithState(forwardedValue, data.state, handleThen(data));
                    },

                    error: failCallback && function(forwardedValue, error) {
                        assignWithState(forwardedValue, promiseState.RESOLVED, failCallback(error));
                    }
                });

                return new promise._$ChainClass(partial(subscribeHandles, handledValue));
            },

            done: function(doneCallback, failCallback, progressCallback) {
                subscribeHandles(this._$value, doneCallback, failCallback, progressCallback);
            },

            isResolved: function() {
                return this._$state === promiseState.RESOLVED;
            },

            isRejected: function() {
                return this._$state === promiseState.REJECTED;
            },

            isInitialized: function() {
                return this._$state !== promiseState.INIT;
            },

            delay: function(ms) {
                var promise = this;

                return new promise._$ChainClass(function(resolve, reject, notify) {
                    var delayedResolve = Fn.delay(resolve, ms);
                    
                    promise.done(delayedResolve, reject, notify);
                });
            },

            timeout: function(ms, reason) {
                var promise = this;

                reason = new Error(reason || format(ERROR_PROMISE_TIMEOUT_REJECTION, {
                    ms: ms
                }));

                return new promise._$ChainClass(function promiseTimeout(resolve, reject, notify) {
                    var delayedReject = Fn.delay(reject, ms);
                    
                    delayedReject(reason);

                    promise.done(resolve, reject, notify);
                });
            }
        },

        fail: function(failCallback) {
            return this.then(null, failCallback);
        },

        progress: function(progressCallback) {
            return this.then(null, null, progressCallback);
        },

        finish: function(finCallback) {
            return this.then(finCallback, finCallback);
        },

        isFinished: function() {
            return this.isResolved() || this.isRejected();
        },

        catchError: function(ErrorClass, catchCallback) {
            return this.fail(function promiseFilterError(reason) {
                if (isA(reason, ErrorClass)) {
                    return catchCallback(reason);
                }
                else {
                    throw reason;
                }
            });
        },

        all: function() {
            return this.then(bind(this.Class.all, this.Class));
        },

        spread: function(spreadCallback, failCallback, progressCallback) {
            return this.all().then(partial(Fn.apply, spreadCallback, null), failCallback, progressCallback);
        },

        _$: {
            state: promiseState.INIT,

            handles: null,

            value: null,

            ChainClass: null,

            transitionState: function(nextState, reason) {
                var isUnhandledRejection = false;

                this._$state = nextState;

                if (nextState !== promiseState.PENDING) {
                    isUnhandledRejection = nextState === promiseState.REJECTED && this._$value.countSubscribers() === 1;

                    this._$value.freeze();

                    if (isUnhandledRejection) {
                        handleUnhandledRejection(this, reason);
                    }
                }
            }
        }
    }, {
        onUnhandledRejection: function(rejectionHandler) {
            isFunction(rejectionHandler) && rejectionHandlers.push(rejectionHandler);
        },


        cast: function(value) {
            var PromiseClass = this,
                promise;

            if (PromiseClass.isInstance(value)) {
                promise = value;
            }
            else if (isThenable(value)) {
                promise = new PromiseClass(bind(value.then, value));
            }
            else if (isFunction(value)) {
                promise = new PromiseClass(value);
            }
            else {
                promise = PromiseClass.resolved(value);
            }

            return promise;
        },

        when: function(promise, doneCallback, failCallback, progressCallback) {
            return this.cast(promise).then(doneCallback, failCallback, progressCallback);
        },

        race: function(promises) {
            var PromiseClass = this;

            return new PromiseClass(function promiseRace(resolve, reject, notify) {
                Arr.each(promises, function promiseLoopForRace(promise) {
                    PromiseClass.when(promise, resolve, reject, notify);
                });
            });
        },

        all: function(promises) {
            var PromiseClass = this,
                count = 0,
                results;

            if (isArrayLike(promises)) {
                promises = Arr.from(promises);
                count = promises.length;
                results = [];
            }
            else if (isObject(promises)) {
                promises = Obj.from(promises);

                count = promises.size();
                results = {};
            }

            return new PromiseClass(function promiseAll(resolve, reject, notify) {
                if (count) {
                    promises.each(function promiseLoopForAll(promise, idx) {
                        PromiseClass.when(promise, function promiseSortForAll(value) {
                            results[idx] = value;

                            notify({
                                indexKey: idx,

                                value: value
                            });

                            --count || resolve(results);
                        }, reject, notify);
                    });
                }
                else {
                    resolve(results);
                }
            });
        },

        spread: function(values, spreadCallback, failCallback, progressCallback) {
            return this.cast(values).spread(spreadCallback, failCallback, progressCallback);
        },

        sequence: function(initialValue, functions) {
            var PromiseClass = this;

            return Arr.reduce(functions, function promiseLoopSequence(lastPromise, nextFunction) {
                return PromiseClass.when(lastPromise, nextFunction);
            }, initialValue);
        },

        delay: function(promise, ms) {
            return this.cast(promise).delay(ms);
        },

        timeout: function(promise, ms, reason) {
            return this.cast(promise).timeout(ms, reason);
        },

        resolved: function(value) {
            var PromiseClass = this;

            return new PromiseClass(function promiseResolve(resolve) {
                resolve(value);
            });
        },

        rejected: function(reason) {
            var PromiseClass = this;

            return new PromiseClass(function promiseReject(resolve, reject) {
                reject(reason);
            });
        }
    });
    
    function subscribeHandles(value, resolvedHandle, rejectedHandle, notifiedHandle) {
        value.subscribe({
            update: partial(handleUpdate, resolvedHandle, notifiedHandle),
            
            error: rejectedHandle
        });
    }

    function handleUpdate(resolvedHandle, notifiedHandle, data) {
        ((data.state === promiseState.RESOLVED ? resolvedHandle : notifiedHandle) || identity)(data.value);
    }

    function isThenable(value) {
        return isObject(value) && isFunction(value.then);
    }

    function createStateTransition(promise, nextState) {
        var $proxy = promise.$proxy;

        return function(data) {
            $proxy(promise, proxiedTransitionState, [nextState, data]);
        };
    }

    function proxiedTransitionState(nextState, data) {
        /*jslint validthis: true */
        this._$transitionState(nextState, data);
    }

    function assignWithState(value, nextState, valueToAssign) {
        value.assign({
            state: nextState,

            value: valueToAssign
        });
    }

    function handleUnhandledRejection(promise, reason) {
        if (rejectionHandlers.length) {
            rejectionHandlers.each(function executeRejectionHandler(rejectionHandler) {
                rejectionHandler(promise, reason);
            });
        }
        else {
            throw new Error(format(ERROR_PROMISE_UNHANDLED_REJECTION, {
                promiseHash: promise.getHash(),
                
                reason: reason
            }));
        }
    }

    function rejectWithPromiseDestructed() {
        /*jslint validthis: true */
        this._$value.error(new Error(ERROR_PROMISE_DESTRUCTED_REJECTION));
    }

    return Promise;
});