JAR.register({
    MID: 'jar.lang.Function',
    deps: ['System', '.Array'],
    bundle: ['Function-advice', 'Function-combined', 'Function-guards', 'Function-modargs']
}, function(System, Arr) {
    'use strict';

    var lang = this,
        fnConverter = lang.sandbox('function(fn, arity) { var newFn=function(){return fn.apply(this,arguments)};newFn.arity=arity||fn.arity||fn.length;return newFn;}', '__SYSTEM__'),
        fromArgs = Arr.from,
        FunctionCopy, apply;

    FunctionCopy = lang.extendNativeType('Function', {
        bind: function(context) {
            var fnToBind = this,
                FnLink = function() {},
                boundArgs = fromArgs(arguments, 1),
                returnFn = fromFunction(function boundFn() {
                    return apply(fnToBind, (System.isA(this, FnLink) && context) ? this : context, boundArgs.concat(fromArgs(arguments)));
                }, fnToBind.arity || fnToBind.length);

            FnLink.prototype = fnToBind.prototype;
            returnFn.prototype = new FnLink();

            return returnFn;
        },
        /**
         * Repeat the given function n times
         * The last parameter refers to the current execution time
         *
         * jar.lang.Function.from(function(time) {
         *	System.out(time + ' time(s) executed');
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
            var args = fromArgs(arguments, 1),
                results = Arr(),
                idx = 0;

            for (; idx < times;) {
                results[idx] = apply(this, null, args.concat(++idx));
            }

            return results;
        },

        delay: function(ms) {
            return window.setTimeout(this, ms);
        },

        call: true,

        apply: true
    }, {
        from: fromFunction,

        fromNative: fromFunction
    });

    apply = FunctionCopy.apply;

    /**
     * 
     * @param {Function} fn
     * 
     * @return {Function}
     */
    function fromFunction(fn, arity) {
        return (System.isA(fn, FunctionCopy) || !System.isFunction(fn)) ? fn : fnConverter(fn, arity);
    }

    return FunctionCopy;
});