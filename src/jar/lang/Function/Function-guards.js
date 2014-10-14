JAR.register({
    MID: 'jar.lang.Function.Function-guards',
    deps: ['..', '..Object!derive']
}, function(lang, Obj) {
    'use strict';

    var FunctionCopy = this,
        fromFunction = FunctionCopy.from,
        apply = FunctionCopy.apply,
        defaultBlockedOptions = {
            leading: true,
            
            trailing: true
        };

    lang.extendNativeType('Function', {
        debounce: function(ms, immediate) {
            return createBlockedFunction(this, ms, {
                leading: immediate,

                trailing: !immediate
            }, true);
        },

        throttle: function(ms, options) {
            return createBlockedFunction(this, ms, options || defaultBlockedOptions);
        },

        memoize: function(serializer) {
            var fn = this,
                cache = {};

            return fromFunction(function memoizedFn() {
                var hash = (serializer || internalSerializer)(arguments);

                return hash in cache ? cache[hash] : (cache[hash] = apply(fn, this, arguments));
            });
        },

        once: function() {
            return FunctionCopy.callN(this, 1);
        },

        callN: function(count) {
            return createGuardedFunction(this, count, false);
        },

        blockN: function(count) {
            return createGuardedFunction(this, count, true);
        }
    });

    function createGuardedFunction(fn, count, guardBefore) {
        var called = 0;

        count = Math.round(Math.abs(count)) || 0;

        return fromFunction(function guardedFn() {
            var unguarded = guardBefore ? called >= count : called < count,
                result;

            if (unguarded) {
                result = apply(fn, this, arguments);
            }

            if (unguarded !== guardBefore) {
                called++;
            }

            return result;
        });
    }

    /**
     *
     * @param {Function} fn
     * @param {Number} msBlocked
     * @param {Object} options
     * @param {Boolean} blockOnCall
     * 
     * @return {Function}
     */
    function createBlockedFunction(fn, msBlocked, options, blockOnCall) {
        var blocked = false,
            lastArgs, timeoutID, context;

        if (!(options.leading || options.trailing)) {
            options = defaultBlockedOptions;
        }

        function unBlock() {
            blocked = false;

            if (lastArgs && options.trailing) {
                apply(fn, context, lastArgs);
                context = lastArgs = null;
            }
        }

        return fromFunction(function blockedFn() {
            context = this;
            timeoutID = blocked;

            if (blockOnCall || !blocked) {
                blocked = window.setTimeout(unBlock, msBlocked);
            }

            if (timeoutID || !options.leading) {
                blockOnCall && window.clearTimeout(timeoutID);
                lastArgs = arguments;
            }
            else {
                apply(fn, context, arguments);
            }
        }, fn.arity || fn.length);
    }

    /**
     * TODO better implementation
     * 
     * @param {Arguments} args
     * 
     * @return {String}
     */
    function internalSerializer(args) {
        return JSON.stringify(args[0]);
    }

    return Obj.extract(FunctionCopy, ['debounce', 'throttle', 'memoize', 'once', 'callN', 'blockN']);
});