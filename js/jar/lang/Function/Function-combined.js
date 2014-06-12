JAR.register({
    MID: 'jar.lang.Function.Function-combined',
    deps: ['System', '..', '..Array!reduce', '..Object!derive']
}, function(System, lang, Arr, Obj) {
    'use strict';

    var FunctionCopy = this,
        fromFunction = FunctionCopy.from,
        apply = FunctionCopy.apply;

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

            function proceed() {
                var result = apply(fn, context, arguments);
                
                context = null;
                
                return result;
            }

            return fromFunction(function wrappedFn() {
                context = this;

                return apply(wrapperFn, context, [proceed, arguments]);
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
        functions = Arr.filter(functions, System.isFunction);
        functions.unshift(fn);

        reversed && (functions = functions.reverse());

        return fromFunction(function pipedFn(result) {
            return functions.reduce(callNextWithResult, result);
        }, fn.arity || fn.length);
    }

    function callNextWithResult(result, next) {
        return next(result);
    }

    return Obj.extract(FunctionCopy, ['compose', 'pipeline', 'wrap']);
});