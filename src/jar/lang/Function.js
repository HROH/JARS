JAR.register({
    MID: 'jar.lang.Function',
    deps: [{
        System: ['::isA', '::isFunction']
    }, '.Array'],
    bundle: ['Function-advice', 'Function-combined', 'Function-flow', 'Function-guards', 'Function-modargs']
}, function(isA, isFunction, Arr) {
    'use strict';

    var lang = this,
        fnConverter = lang.sandbox('__SYSTEM__').add('function(f, a){function fn(){return f.apply(this,arguments)};fn.arity=a||f.arity||f.length;return fn;}'),
        fromArgs = Arr.from,
        FunctionCopy, apply;

    FunctionCopy = lang.extendNativeType('Function', {
        bind: function(context) {
            var fnToBind = this,
                FnLink = function() {},
                boundArgs = fromArgs(arguments).slice(1),
                returnFn = fromFunction(function boundFn() {
                    return apply(fnToBind, (isA(this, FnLink) && context) ? this : context, boundArgs.concat(fromArgs(arguments)));
                }, fnToBind.arity || fnToBind.length);

            FnLink.prototype = fnToBind.prototype;
            returnFn.prototype = new FnLink();

            return returnFn;
        },

        negate: function() {
            var fn = this;

            return fromFunction(function() {
                return !fn.apply(this, arguments);
            }, fn.arity || fn.length);
        },
        /**
         * Repeat the given function n times
         * The last parameter refers to the current execution time
         *
         * jar.lang.Function.from(function(time) {
         *	System.Logger.log(time + ' time(s) executed');
         * }).repeat(5);
         *
         * outputs:
         *
         * '1 time(s) executed'
         * '2 time(s) executed'
         * '3 time(s) executed'
         * '4 time(s) executed'
         * '5 time(s) executed'
         */
        repeat: function(times) {
            var args = fromArgs(arguments).slice(1),
                results = Arr(),
                idx = 0;

            for (; idx < times;) {
                results[idx] = apply(this, null, args.concat(++idx));
            }

            return results;
        },

        call: true,

        apply: true
    }, {
        from: fromFunction,

        fromNative: fromFunction,

        noop: function() {},

        identity: function(value) {
            return value;
        }
    });

    apply = FunctionCopy.apply;

    /**
     *
     * @param {Function} fn
     *
     * @return {Function}
     */
    function fromFunction(fn, arity) {
        return (isA(fn, FunctionCopy) || !isFunction(fn)) ? fn : fnConverter(fn, arity);
    }

    return FunctionCopy;
});