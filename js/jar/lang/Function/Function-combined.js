JAR.register({
    MID: 'jar.lang.Function.Function-combined',
    deps: ['..', '..Array!reduce', 'System']
}, function(lang, Arr, System) {
    'use strict';

    var FunctionCopy = this,
        fromFunction = FunctionCopy.from;

    lang.extendNativeType('Function', {
        compose: function() {
            return createFunctionPipe(this, arguments, true);
        },

        pipeline: function() {
            return createFunctionPipe(this, arguments);
        },

        wrap: function(wrapperFn) {
            var fn = this,
                context;

            function scoppedFn() {
                return fn.apply(context, arguments);
            }

            return fromFunction(function wrappedFn() {
                context = this;

                return wrapperFn.call(context, scoppedFn);
            }, wrapperFn.arity || wrapperFn.length);
        }
    });

    /**
     *
     * @param {Function} fn
     * @param {Arguments} functions
     * @param {Boolean} reversed
     * 
     * @return {Function}
     */
    function createFunctionPipe(fn, functions, reversed) {
        functions = Arr.from(functions);
        functions.unshift(fn);

        reversed && (functions = functions.reverse());

        return fromFunction(function pipedFn(result) {
            return functions.reduce(callNextWithResult, result);
        }, fn.arity || fn.length);
    }

    function callNextWithResult(result, next) {
        return System.isFunction(next) ? next(result) : result;
    }

    return {
        compose: FunctionCopy.compose,

        pipeline: FunctionCopy.pipeline,
        
        wrap: FunctionCopy.wrap
    };
});