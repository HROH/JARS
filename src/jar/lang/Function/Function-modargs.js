JAR.register({
    MID: 'jar.lang.Function.Function-modargs',
    deps: ['System', '..', '..Array', '..Object!derive']
}, function(System, lang, Arr, Obj) {
    'use strict';

    var FunctionCopy = this,
        fromFunction = FunctionCopy.from,
        apply = FunctionCopy.apply,
        fromArgs = Arr.from;

    lang.extendNativeType('Function', {
        flip: function() {
            var fn = this;

            return fromFunction(function flippedFn() {
                return apply(fn, this, Arr.reverse(arguments));
            }, fn.arity || fn.length);
        },

        curry: function(arity) {
            var fn = this;

            arity = arity || this.arity || this.length;

            return fromFunction(arity < 2 ? this : function curryFn() {
                var args = fromArgs(arguments),
                    result;

                if (args.length >= arity) {
                    result = apply(fn, this, args);
                }
                else {
                    result = fromFunction(function curriedFn() {
                        return apply(curryFn, this, args.concat(fromArgs(arguments)));
                    }, arity - args.length);
                }

                return result;
            }, arity);
        },

        partial: function() {
            return createArgumentsMapper(this, arguments, applyPartialArg);
        },
        /**
         * Store the arguments in placeholderArgs
         * They will be used in the call to func as default if no other arguments are available
         * 
         * Example:
         * 
         * function(a) {
         *	return a || value;
         * }
         * 
         * This would be equal to:
         * 
         * jar.lang.Function.from(function(a) {
         *	return a;
         * }).defaults(value);
         *
         * 
         *
         *
         */
        defaults: function() {
            return createArgumentsMapper(this, arguments, applyPlaceholderArg);
        }
    }, {
        isPlaceholderArg: System.isNull
    });

    /**
     *
     * @param {Function} fn
     * @param {Arguments} args
     * @param {Function} mapFn
     * 
     * @return {Function}
     */
    function createArgumentsMapper(fn, args, mapFn) {
        args = fromArgs(args);

        return fromFunction(function mappedFn() {
            var newArgs = fromArgs(arguments),
                mappedArgs = args.map(mapFn, newArgs);

            return apply(fn, this, mappedArgs.concat(newArgs));
        }, fn.arity || fn.length);
    }

    /**
     * 
     * @param {*} partialArg
     * 
     * @return {*}
     */
    function applyPartialArg(partialArg) {
        return FunctionCopy.isPlaceholderArg(partialArg) ? this.shift() : partialArg;
    }

    /**
     * 
     * @param {*} placeholderArg
     * 
     * @return {*}
     */
    function applyPlaceholderArg(placeholderArg) {
        var newArgs = this,
            newArg;

        if (newArgs.length) {
            newArg = newArgs.shift();

            FunctionCopy.isPlaceholderArg(newArg) || (placeholderArg = newArg);
        }

        return placeholderArg;
    }

    return Obj.extract(FunctionCopy, ['curry', 'defaults', 'flip', 'partial']);
});