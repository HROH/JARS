JAR.module('jar.lang.Function.Function-flow').$import([
    {
        '.': [
            '::from',
            '::apply'
        ]
    },
    'System::env',
    '..Array::from',
    '..Object!derive'
]).$export(function(fromFunction, applyFunction, env, fromArgs, Obj) {
    'use strict';

    var Fn = this,
        global = env.global,
        defaultRegulatorOptions = {
            leading: true,

            trailing: true
        };

    Fn.enhance({
        debounce: function(ms, immediate) {
            return createRegulatorFunction(this, ms, {
                leading: immediate,

                trailing: !immediate
            }, true);
        },

        throttle: function(ms, options) {
            return createRegulatorFunction(this, ms, options || defaultRegulatorOptions);
        },

        delay: function(ms) {
            var fn = this;

            return fromFunction(function delayedFn() {
                var context = this,
                    args = fromArgs(arguments);

                global.setTimeout(function() {
                    applyFunction(fn, context, args);
                }, ms);
            });
        }
    });

    /**
     *
     * @param {Function} fn
     * @param {Number} msClosed
     * @param {Object} options
     * @param {Boolean} resetOnCall
     * 
     * @return {Function}
     */
    function createRegulatorFunction(fn, msClosed, options, resetOnCall) {
        var closed = false,
            lastArgs, timeoutID, context;

        if (!(options.leading || options.trailing)) {
            options = defaultRegulatorOptions;
        }

        function open() {
            closed = false;

            if (lastArgs && options.trailing) {
                applyFunction(fn, context, lastArgs);
                context = lastArgs = null;
            }
        }

        return fromFunction(function regulatorFn() {
            context = this;
            timeoutID = closed;

            if (resetOnCall || !closed) {
                closed = global.setTimeout(open, msClosed);
            }

            if (timeoutID || !options.leading) {
                resetOnCall && global.clearTimeout(timeoutID);
                lastArgs = arguments;
            }
            else {
                applyFunction(fn, context, arguments);
            }
        }, fn.arity || fn.length);
    }

    return Obj.extract(Fn, ['debounce', 'throttle', 'delay']);
});