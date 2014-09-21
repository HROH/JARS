JAR.register({
    MID: 'jar.async.Promise',
    deps: [{
        System: ['.', '!']
    }, 'jar', {
        '..lang': ['Class', 'Object!derive,info,iterate', 'Array!iterate,reduce']
    }]
}, function(System, config, jar, Class, Obj, Arr) {
    'use strict';

    // TODO support stacktraces:
    // - combine stacks of previous and current error
    // - filter unwanted information
    // - resources: https://github.com/kriskowal/q/blob/v2/q.js
    // Unhandled rejection:
    // - always throw, consume per promise or consume if configured?

    var async = this,
        isFunction = System.isFunction,
        isObject = System.isObject,
        isA = System.isA,
        rejectionHandlers = Arr(),
        PROMISE_INIT = 1,
        PROMISE_PENDING = 2,
        PROMISE_REJECTED = 4,
        PROMISE_RESOLVED = 8,
        handleMap = Obj.from({
            resolve: PROMISE_RESOLVED,
            reject: PROMISE_REJECTED,
            notify: PROMISE_PENDING
        }),
        stateMap = handleMap.invert(),
        Promise;

    Promise = Class('Promise', {
        $: {
            construct: function(resolver, resolveInternal) {
                var promise = this;

                promise._$ChainClass = Promise;

                promise._$promises = Arr();
                promise._$handles = handleMap.map(createHandle, promise);

                resolveInternal ? promise._$setInitialized() : promise.when(resolver);
            },

            when: function(resolver) {
                var promise = this,
                    handles = promise._$handles,
                    resolve = handles.resolve,
                    reject = handles.reject;

                if (System.isSet(resolver) && !promise.isInitialized()) {
                    promise._$setInitialized();

                    if (isFunction(resolver)) {
                        async.wait(tryCatch, 0, resolver, [resolve, reject, handles.notify], reject);
                    }
                    else {
                        async.wait(resolve, 0, resolver);
                    }
                }

                return this;
            },

            then: function(doneCallback, failCallback, progressCallback) {
                var promise = this,
                    linkedPromiseData = {
                        promise: new promise._$ChainClass(null, true),
                        callbacks: {
                            resolve: doneCallback,
                            reject: failCallback,
                            notify: progressCallback
                        }
                    };

                promise._$promises.push(linkedPromiseData);

                if (promise.isFinished()) {
                    async.wait(promise.$proxy, 0, promise, promise._$invokeAll);
                }

                return linkedPromiseData.promise;
            },

            isResolved: function() {
                return this._$state === PROMISE_RESOLVED;
            },

            isRejected: function() {
                return this._$state === PROMISE_REJECTED;
            },

            isInitialized: function() {
                return this._$state !== PROMISE_INIT;
            }
        },

        done: function(doneCallback, failCallback, progressCallback) {
            this.then(doneCallback, failCallback, progressCallback);
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

        all: function() {
            return this.then(this.Class.all);
        },

        spread: function(spreadCallback, failCallback, progressCallback) {
            return this.all().then(function promiseSpread(valueArray) {
                return spreadCallback.apply(null, valueArray);
            }, failCallback, progressCallback);
        },

        isFinished: function() {
            return this.isResolved() || this.isRejected();
        },

        delay: function(ms) {
            var promise = this;

            return new promise._$ChainClass(function(resolve, reject, notify) {
                promise.then(function promiseDelay(value) {
                    async.wait(resolve, ms, value);
                }, reject, notify);
            });
        },

        timeout: function(ms, reason) {
            var promise = this;

            return new promise._$ChainClass(function promiseTimeout(resolve, reject, notify) {
                async.wait(reject, ms, new Error(reason || 'Timed out after ' + ms + ' ms'));

                promise.then(resolve, reject, notify);
            });
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

        _$: {
            state: PROMISE_INIT,

            handles: null,

            promises: null,

            value: '',

            ChainClass: null,

            setInitialized: function() {
                this._$state = PROMISE_PENDING;
            },

            hasPromiseInChain: function(valueAsPromise) {
                var promise = this;

                return promise._$promises.some(function hasPromiseInChain(linkedPromiseData) {
                    return linkedPromiseData.promise === valueAsPromise || promise.$proxy(linkedPromiseData.promise, proxiedHasPromiseInChain, [valueAsPromise]);
                });
            },

            transitionState: function(newState, value) {
                var promise = this,
                    handles = promise._$handles,
                    errorMessage;

                if (!promise.isFinished()) {
                    errorMessage = getPromiseTransitionError(promise, newState, value);

                    if (errorMessage) {
                        value = new Error(errorMessage);
                        newState = PROMISE_REJECTED;
                    }

                    if (isA(value, Promise) || isThenable(value)) {
                        value.then(handles.resolve, handles.reject, handles.notify);
                    }
                    else {
                        promise._$state = newState;
                        promise._$value = value;

                        promise._$invokeAll();
                    }
                }
            },

            invokeAll: function() {
                var promise = this,
                    state = promise._$state,
                    linkedPromises = promise._$promises;

                if (linkedPromises.length) {
                    linkedPromises.each(this._$invokeCallback, promise);

                    state !== PROMISE_PENDING && (linkedPromises.length = 0);
                }
                else if (state === PROMISE_REJECTED) {
                    handleUnhandledRejection(promise, promise._$value);
                }
            },

            invokeCallback: function(linkedPromiseData) {
                var promise = this,
                    linkedPromise = linkedPromiseData.promise,
                    state = promise._$state,
                    value = promise._$value,
                    callback = linkedPromiseData.callbacks[stateMap[state]],
                    handles = promise.$proxy(linkedPromise, proxiedGetPromiseHandles);

                if (isFunction(callback)) {
                    value = tryCatch(callback, [value], handles.reject);

                    state === PROMISE_REJECTED && (state = PROMISE_RESOLVED);
                }

                handles[stateMap[state]](value);
            }
        }
    }, {
        handleRejection: function(rejectionHandler) {
            isFunction(rejectionHandler) && rejectionHandlers.push(rejectionHandler);
        },

        cast: function(value) {
            var PromiseClass = this,
                promise;

            if (isA(value, PromiseClass)) {
                promise = value;
            }
            else if (isThenable(value)) {
                promise = new PromiseClass(function promiseCast(resolve, reject, notify) {
                    value.then(resolve, reject, notify);
                });
            }
            else {
                promise = new PromiseClass(value);
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

            if (System.isArrayLike(promises)) {
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

    Promise.addDestructor(function promiseDestructor() {
        this._$handles.reject(new Error('The connected promise was destructed'));
    });

    function proxiedTransitionState(newState, value) {
        this._$transitionState(newState, value);
    }

    function proxiedGetPromiseHandles() {
        return this._$handles;
    }

    function proxiedHasPromiseInChain(valueAsPromise) {
        return this._$hasPromiseInChain(valueAsPromise);
    }

    function tryCatch(fn, args, reject) {
        var result;

        try {
            result = fn.apply(null, args);
        }
        catch (e) {
            if (isA(e, UnhandledRejectionError)) {
                throw e;
            }
            else {
                reject(e);
            }
        }

        return result;
    }

    /**
     * @param {string} state
     * 
     * @return {function(*):Promise}
     */
    function createHandle(state) {
        var promise = this,
            $proxy = promise.$proxy;

        return function promiseHandle(value) {
            $proxy(promise, proxiedTransitionState, [state, value]);
        };
    }

    function getPromiseTransitionError(promise, newState, value) {
        var promiseHash = promise.getHash(),
            errorMessage;

        if (newState === PROMISE_RESOLVED && isA(value, Promise)) {
            if (value === promise) {
                errorMessage = promiseHash + ' can\'t be resolved with itself!';
            }
            else if (config('checkInfiniteRecursion') && (promise._$hasPromiseInChain(value) || promise.$proxy(value, proxiedHasPromiseInChain, [promise]))) {
                errorMessage = 'Infinite recursion between ' + promiseHash + ' and ' + value.getHash();
            }
        }
        else if (newState === PROMISE_REJECTED && !isA(value, Error)) {
            errorMessage = promiseHash + ' must be rejected with an error!';
        }

        return errorMessage;
    }

    function handleUnhandledRejection(promise, reason) {
        if (rejectionHandlers.length) {
            rejectionHandlers.each(function executeRejectionHandler(rejectionHandler) {
                rejectionHandler(promise, reason);
            });
        }
        else {
            throw new UnhandledRejectionError('Unhandled rejection of "' + promise.getHash() + '" with reason: ' + reason);
        }
    }

    function isThenable(value) {
        return isObject(value) && isFunction(value.then);
    }

    function UnhandledRejectionError(message) {
        this.message = message;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnhandledRejectionError);
        }
    }

    UnhandledRejectionError.prototype = Obj.extend(new Error(), {
        constructor: UnhandledRejectionError,
        name: 'UnhandledRejectionError'
    });

    return Promise;
});