JAR.module('jar.lang.Function.Function-modargs').$import([
    {
        '.': [
            '::from',
            '::apply'
        ],
        '..Array': [
            '::from',
            '::reverse'
        ]
    },
    'System!',
    '..Object!derive'
]).$export(function(fromFunction, applyFunction, fromArgs, reverseArray, config, Obj) {
    'use strict';

    var Fn = this;

    Fn.enhance({
        flip: function() {
            var fn = this;

            return fromFunction(function flippedFn() {
                return applyFunction(fn, this, reverseArray(arguments));
            }, fn.arity || fn.length);
        },

        functional: function(arity) {
            return Fn.curry(Fn.flip(this), arity);
        },

        curry: function(arity) {
            var fn = this;

            arity = arity || fn.arity || fn.length;

            return fromFunction(arity < 2 ? fn : function curryFn() {
                var args = fromArgs(arguments),
                    result;

                if (args.length >= arity) {
                    result = applyFunction(fn, this, args);
                }
                else {
                    result = fromFunction(function curriedFn() {
                        return applyFunction(curryFn, this, args.concat(fromArgs(arguments)));
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
        placeholderArg: config.placeholderArg || null
    });


    function isPlaceholderArg(arg) {
        return arg === Fn.placeholderArg;
    }

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

            return applyFunction(fn, this, mappedArgs.concat(newArgs));
        }, fn.arity || fn.length);
    }

    /**
     * 
     * @param {*} partialArg
     * 
     * @return {*}
     */
    function applyPartialArg(partialArg) {
        /*jslint validthis: true */
        return isPlaceholderArg(partialArg) ? this.shift() : partialArg;
    }

    /**
     * 
     * @param {*} placeholderArg
     * 
     * @return {*}
     */
    function applyPlaceholderArg(placeholderArg) {
        /*jslint validthis: true */
        var newArgs = this,
            newArg;

        if (newArgs.length) {
            newArg = newArgs.shift();

            isPlaceholderArg(newArg) || (placeholderArg = newArg);
        }

        return placeholderArg;
    }

    return Obj.extract(Fn, ['curry', 'defaults', 'flip', 'functional', 'partial']);
});