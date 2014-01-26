JAR.register({
    MID: 'jar.lang.Function.Function-guards',
    deps: ['..', '..Object']
}, function(lang, Obj) {
    'use strict';

    var FunctionCopy = this,
        fromFunction = FunctionCopy.from,
        apply = FunctionCopy.apply,
        defaultBlockedOptions = {
            leading: true,
            tailing: true
        };

    lang.extendNativeType('Function', {
        debounce: function(ms, immediate) {
            return createBlockedFunction(this, ms, {
                leading: immediate,

                tailing: !immediate
            }, true);
        },

        throttle: function(ms, options) {
            return createBlockedFunction(this, ms, Obj.extend(options || {}, defaultBlockedOptions));
        },

        memoize: function() {}
    });

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

        function unBlock() {
            blocked = false;

            if (lastArgs && options.tailing) {
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

    return {
        debounce: FunctionCopy.debounce,

        throttle: FunctionCopy.throttle,
        
        memoize: FunctionCopy.memoize
    };
});